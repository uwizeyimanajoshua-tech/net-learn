import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { User, Document, ChatSession, Quiz, Flashcard, StudentProgress, OfficialExam, ExamSession, ExamSubmission } from '../types.js';
import { CATEGORIES } from '../types.js';

// Read Firebase applet configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = null;
if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.warn('Could not read firebase-applet-config.json:', e);
  }
}

// Initialize Firestore SDK using the web config and enterprise databaseId
let dbFirestore: Firestore | null = null;
let firestoreEnabled = false;

try {
  if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      dbFirestore = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      }, firebaseConfig.firestoreDatabaseId);
    } catch {
      dbFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    }
    firestoreEnabled = true;
    console.log('[Firestore] Initialized successfully with database:', firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn('[Firestore] No valid Firebase configuration found. Using local JSON store.');
  }
} catch (error) {
  console.warn('Firebase initialization skipped or failed. Using local storage.', error);
}

async function runFirestore<T>(op: () => Promise<T>, timeoutMs = 12000): Promise<T | null> {
  if (!firestoreEnabled || !dbFirestore) return null;
  try {
    const opPromise = op();
    const timeoutPromise = new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs));
    return await Promise.race([opPromise, timeoutPromise]);
  } catch (err: any) {
    const msg = err?.message || '';
    console.warn('Firestore operation notice:', msg);
    return null;
  }
}

// Deep object cleaner to prevent Firebase "Unsupported field value: undefined" errors
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result;
}

// Helper to detect broken RTB TOC-stub sections or duplicate empty indicative content slices
export function hasBrokenCurriculumStubs(sections?: any[]): boolean {
  if (!Array.isArray(sections) || sections.length === 0) return false;
  let tocDashTitles = 0;
  let emptyIndicative = 0;
  let tocSectionCount = 0;
  for (const s of sections) {
    const title = String(s?.title || '');
    const content = String(s?.content || '');
    if (/table\s+of\s+content/i.test(title)) tocSectionCount++;
    if (/(?:-{2,}|\.{2,}|–{2,})\s*[0-9ivxlc]+\s*$/i.test(title) || /(?:-{3,})\s*\d+\s*$/.test(content.trim())) {
      tocDashTitles++;
    }
    if (/indicative\s+content/i.test(title) && content.length < 320) {
      emptyIndicative++;
    }
  }
  return tocSectionCount > 1 || tocDashTitles >= 2 || emptyIndicative >= 2;
}

// Keep every Firestore document safely under Firestore's 1 MiB (1,048,576 bytes) ceiling
// while preserving full raw uploaded text AND ALL curriculum sections.
function prepareDocumentForFirestore(docObj: any): Record<string, any> {
  const clean: any = sanitizeForFirestore(docObj);
  if (typeof clean.fileData === 'string' && clean.fileData.length > 260000) {
    delete clean.fileData;
  }
  if (Array.isArray(clean.splitContent) && clean.splitContent.length > 120) {
    clean.splitContent = clean.splitContent.slice(0, 120);
  }

  const MAX_BYTES = 820000;
  let serializedLen = Buffer.byteLength(JSON.stringify(clean), 'utf8');
  if (serializedLen > MAX_BYTES) {
    delete clean.fileData;
    serializedLen = Buffer.byteLength(JSON.stringify(clean), 'utf8');
  }

  // Strip duplicated inline data:image/svg+xml markdown from splitContent if images[] already stores figures
  if (serializedLen > MAX_BYTES && Array.isArray(clean.splitContent)) {
    clean.splitContent = clean.splitContent.map((sec: any) => ({
      ...sec,
      content: typeof sec?.content === 'string'
        ? sec.content.replace(/!\[[^\]]*\]\(data:image\/svg\+xml[^)]+\)\s*/g, '')
        : '',
    }));
    serializedLen = Buffer.byteLength(JSON.stringify(clean), 'utf8');
  }

  // Only trim raw textContent to the exact remaining byte budget when total payload exceeds MAX_BYTES
  if (serializedLen > MAX_BYTES && typeof clean.textContent === 'string' && clean.textContent.length > 6000) {
    const withoutText = { ...clean, textContent: '' };
    const baseBytes = Buffer.byteLength(JSON.stringify(withoutText), 'utf8');
    const availableForText = Math.max(6000, MAX_BYTES - baseBytes - 4096);
    if (clean.textContent.length > availableForText) {
      clean.textContent = clean.textContent.slice(0, availableForText);
    }
    serializedLen = Buffer.byteLength(JSON.stringify(clean), 'utf8');
  }

  // Only if splitContent ALONE still exceeds budget, trim per-section proportionally while keeping EVERY section
  if (serializedLen > MAX_BYTES && Array.isArray(clean.splitContent) && clean.splitContent.length > 0) {
    const perSecBudget = Math.max(1500, Math.floor(700000 / clean.splitContent.length));
    clean.splitContent = clean.splitContent.map((sec: any) => ({
      ...sec,
      content: typeof sec?.content === 'string' ? sec.content.slice(0, perSecBudget) : '',
      images: Array.isArray(sec?.images) ? sec.images.slice(0, 1) : undefined
    }));
    serializedLen = Buffer.byteLength(JSON.stringify(clean), 'utf8');
  }

  if (serializedLen > MAX_BYTES && Array.isArray(clean.splitContent) && clean.splitContent.length > 0) {
    const strictBudget = Math.max(800, Math.floor(620000 / clean.splitContent.length));
    clean.splitContent = clean.splitContent.map((sec: any) => ({
      ...sec,
      content: typeof sec?.content === 'string' ? sec.content.slice(0, strictBudget) : '',
      images: undefined
    }));
  }
  return sanitizeForFirestore(clean);
}

import { neon } from '@neondatabase/serverless';

// Initialize Neon Postgres client
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
export let sqlClient: ReturnType<typeof neon> | null = null;
if (databaseUrl) {
  try {
    sqlClient = neon(databaseUrl);
    console.log('[Neon Postgres] Client initialized with DATABASE_URL');
  } catch (err) {
    console.warn('[Neon Postgres] Client initialization skipped:', err);
  }
}

export async function runNeon<T>(op: (sql: ReturnType<typeof neon>) => Promise<T>): Promise<T | null> {
  if (!sqlClient) return null;
  try {
    const opPromise = op(sqlClient);
    const timeoutPromise = new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Neon timeout')), 3000));
    return await Promise.race([opPromise, timeoutPromise]);
  } catch (err: any) {
    console.warn('[Neon Postgres] Query notice:', err?.message || err);
    return null;
  }
}

const isServerless = !!(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NODE_ENV === 'production');
const STORE_PATH = isServerless 
  ? path.join('/tmp', 'db_store.json') 
  : path.join(process.cwd(), 'db_store.json');

interface DatabaseSchema {
  users: User[];
  documents: Document[];
  chats: ChatSession[];
  quizzes: Quiz[];
  exams: OfficialExam[];
  examSessions: ExamSession[];
  examSubmissions: ExamSubmission[];
  flashcards: Flashcard[];
  progress: StudentProgress[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin',
      email: 'uwizeyimanajoshua@gmail.com',
      username: 'Joshua Uwizeyimana',
      password: '123',
      role: 'admin',
      isVerified: true,
      createdAt: new Date('2026-01-01').toISOString()
    },
    {
      id: 'usr_student',
      email: 'student@netech.edu',
      username: 'Student',
      password: 'student123',
      role: 'student',
      isVerified: true,
      createdAt: new Date('2026-02-15').toISOString()
    }
  ],
  documents: [],
  chats: [
    {
      id: 'chat_1',
      userId: 'usr_student',
      title: 'VLAN and Trunk Ports query',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'What is a trunk port on a switch?',
          timestamp: new Date('2026-07-16T10:00:00').toISOString()
        },
        {
          id: 'm2',
          sender: 'ai',
          text: 'A trunk port is a special switch port configured to carry traffic for multiple VLANs over a single physical link. It uses trunking encapsulation standards, most commonly **IEEE 802.1Q**, to tag each Ethernet frame with its corresponding VLAN ID as it travels across switches. This ensures switches know which VLAN the frame belongs to on the other side.',
          timestamp: new Date('2026-07-16T10:00:15').toISOString(),
          isRag: true,
          sources: ['Chapter 2: Virtual Local Area Networks (VLANs)']
        }
      ],
      createdAt: new Date('2026-07-16T10:00:00').toISOString(),
      updatedAt: new Date('2026-07-16T10:00:15').toISOString()
    }
  ],
  quizzes: [
    {
      id: 'quiz_net',
      title: 'CCNA Routing & Switching Quiz',
      category: 'Networking',
      docId: 'doc_1',
      questions: [
        {
          id: 'qn_1',
          question: 'What Layer of the OSI model does a standard Router operate at?',
          options: [
            'Layer 1 (Physical)',
            'Layer 2 (Data Link)',
            'Layer 3 (Network)',
            'Layer 4 (Transport)'
          ],
          answer: 2,
          explanation: 'Routers operate at Layer 3 (Network) of the OSI model because they make forwarding decisions based on logical IP addresses.'
        },
        {
          id: 'qn_2',
          question: 'Which trunking protocol is the industry standard for tagging frames across switches?',
          options: [
            'ISL',
            '802.1Q',
            'VTP',
            'OSPF'
          ],
          answer: 1,
          explanation: '802.1Q (often written as dot1q) is the IEEE open-standard protocol used to insert a 4-byte VLAN tag into Ethernet frames.'
        }
      ],
      createdAt: new Date('2026-03-12').toISOString()
    },
    {
      id: 'quiz_linux',
      title: 'Linux System Permissions Challenge',
      category: 'Linux',
      docId: 'doc_2',
      questions: [
        {
          id: 'ql_1',
          question: 'What octal permission code corresponds to read, write, and execute for Owner, and read/execute for Group and Others?',
          options: [
            '644',
            '755',
            '700',
            '777'
          ],
          answer: 1,
          explanation: '755 corresponds to rwxr-xr-x (Owner: 4+2+1=7, Group: 4+1=5, Others: 4+1=5).'
        },
        {
          id: 'ql_2',
          question: 'Which directory is primarily used for storing system-wide configuration files in Linux?',
          options: [
            '/bin',
            '/var',
            '/etc',
            '/home'
          ],
          answer: 2,
          explanation: 'System-wide configurations are saved in the /etc directory. User configurations are usually in home directories.'
        }
      ],
      createdAt: new Date('2026-04-06').toISOString()
    }
  ],
  flashcards: [
    {
      id: 'fc_1',
      userId: 'usr_student',
      category: 'Networking',
      docId: 'doc_1',
      front: 'What is the default VLAN for Cisco switch ports?',
      back: 'VLAN 1 is the default management/native VLAN on Cisco switches.',
      isMastered: false,
      createdAt: new Date('2026-03-11').toISOString()
    },
    {
      id: 'fc_2',
      userId: 'usr_student',
      category: 'Linux',
      docId: 'doc_2',
      front: 'What does the FHS stand for and what is its role?',
      back: 'Filesystem Hierarchy Standard. It defines the structure and layout of directories in Unix-like operating systems.',
      isMastered: true,
      createdAt: new Date('2026-04-06').toISOString()
    }
  ],
  progress: [
    {
      userId: 'usr_student',
      studiedModules: ['doc_1'],
      weakTopics: ['Linux Octal permissions'],
      strongTopics: ['IP Routing tables', 'OSI model'],
      quizScores: [
        {
          quizId: 'quiz_net',
          quizTitle: 'CCNA Routing & Switching Quiz',
          category: 'Networking',
          score: 2,
          maxScore: 2,
          date: new Date('2026-07-15T15:30:00').toISOString()
        }
      ],
      aiUsageCount: 4,
      lastActive: new Date().toISOString()
    }
  ],
  exams: [],
  examSessions: [],
  examSubmissions: []
};

// Helper to safely write and read store
function loadDB(): DatabaseSchema {
  try {
    const rootStore = path.join(process.cwd(), 'db_store.json');
    if (STORE_PATH !== rootStore && fs.existsSync(rootStore)) {
      if (!fs.existsSync(STORE_PATH) || fs.statSync(rootStore).mtimeMs > fs.statSync(STORE_PATH).mtimeMs) {
        try {
          fs.copyFileSync(rootStore, STORE_PATH);
        } catch (e) {
          console.warn('Notice: could not copy initial db_store to /tmp:', e);
        }
      }
    }

    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(data);
      let isModified = false;

      if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = JSON.parse(JSON.stringify(DEFAULT_DB.users));
        isModified = true;
      }
      if (!parsed.documents || !Array.isArray(parsed.documents) || parsed.documents.length === 0) {
        parsed.documents = JSON.parse(JSON.stringify(DEFAULT_DB.documents));
        isModified = true;
      }
      if (!parsed.chats || !Array.isArray(parsed.chats)) {
        parsed.chats = JSON.parse(JSON.stringify(DEFAULT_DB.chats));
        isModified = true;
      }
      if (!parsed.quizzes || !Array.isArray(parsed.quizzes) || parsed.quizzes.length === 0) {
        parsed.quizzes = JSON.parse(JSON.stringify(DEFAULT_DB.quizzes));
        isModified = true;
      }
      if (!parsed.flashcards || !Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
        parsed.flashcards = JSON.parse(JSON.stringify(DEFAULT_DB.flashcards));
        isModified = true;
      }
      if (!parsed.progress || !Array.isArray(parsed.progress)) {
        parsed.progress = JSON.parse(JSON.stringify(DEFAULT_DB.progress));
        isModified = true;
      }
      if (!parsed.exams || !Array.isArray(parsed.exams)) {
        parsed.exams = [];
        isModified = true;
      }
      if (!parsed.examSessions || !Array.isArray(parsed.examSessions)) {
        parsed.examSessions = [];
        isModified = true;
      }
      if (!parsed.examSubmissions || !Array.isArray(parsed.examSubmissions)) {
        parsed.examSubmissions = [];
        isModified = true;
      }

      if (isModified) {
        saveDB(parsed);
      }
      return parsed;
    }
    // Write default DB if not present
    saveDB(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  } catch (error) {
    console.error('Error loading DB, reverting to default:', error);
    saveDB(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function saveDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    try {
      const fallbackPath = path.join('/tmp', 'db_store.json');
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB to fallback:', error, e);
    }
  }

  // Also keep workspace root db_store.json in sync if different from STORE_PATH
  try {
    const rootStore = path.join(process.cwd(), 'db_store.json');
    if (STORE_PATH !== rootStore) {
      fs.writeFileSync(rootStore, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (syncRootErr) {
    // Non-critical if running in read-only environment
  }
}

export const db = {
  // Users
  getUsers: () => loadDB().users,
  getUserById: (id: string) => loadDB().users.find(u => u.id === id),
  getUserByEmail: (email: string) => loadDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User) => {
    const data = loadDB();
    data.users.push(user);
    data.progress.push({
      userId: user.id,
      studiedModules: [],
      weakTopics: [],
      strongTopics: [],
      quizScores: [],
      aiUsageCount: 0,
      lastActive: new Date().toISOString()
    });
    saveDB(data);

    runFirestore(async () => {
      const cleanUser: any = { ...user };
      delete cleanUser.password;
      await setDoc(doc(dbFirestore!, 'users', user.id), cleanUser, { merge: true });
      console.log(`Saved user ${user.id} to Firestore.`);
    });

    runNeon(async (sql) => {
      await sql`
        INSERT INTO users (id, email, username, password, role, is_verified, created_at, avatar)
        VALUES (${user.id}, ${user.email}, ${user.username}, ${user.password || '123'}, ${user.role || 'student'}, ${user.isVerified ?? true}, ${user.createdAt || new Date().toISOString()}, ${user.avatar || null})
        ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role, password = EXCLUDED.password;
      `;
    });

    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const data = loadDB();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates };
      saveDB(data);

      runFirestore(async () => {
        const fullUser: any = { ...data.users[idx] };
        delete fullUser.password;
        await setDoc(doc(dbFirestore!, 'users', id), fullUser, { merge: true });
        console.log(`Updated user ${id} in Firestore.`);
      });

      runNeon(async (sql) => {
        const u = data.users[idx];
        await sql`
          UPDATE users 
          SET username = ${u.username}, role = ${u.role}, is_verified = ${u.isVerified ?? true}, avatar = ${u.avatar || null}, reset_token = ${u.resetToken || null}, reset_expires = ${u.resetExpires || null}
          WHERE id = ${id};
        `;
      });

      return data.users[idx];
    }
    return null;
  },
  deleteUser: (id: string) => {
    const data = loadDB();
    data.users = data.users.filter(u => u.id !== id);
    data.progress = data.progress.filter(p => p.userId !== id);
    data.chats = data.chats.filter(c => c.userId !== id);
    data.flashcards = data.flashcards.filter(f => f.userId !== id);
    saveDB(data);

    runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'users', id));
    });

    runNeon(async (sql) => {
      await sql`DELETE FROM users WHERE id = ${id};`;
    });
  },

  // Documents
  getDocuments: () => loadDB().documents,
  getDocumentById: (id: string) => loadDB().documents.find(d => d.id === id),
  createDocument: async (newDoc: Document) => {
    const localDoc: Document = { ...newDoc };
    if (localDoc.fileData && localDoc.fileData.length > 260000) {
      delete localDoc.fileData;
    }

    const data = loadDB();
    data.documents.push(localDoc);
    saveDB(data);

    try {
      await runFirestore(async () => {
        const firestoreDoc = prepareDocumentForFirestore(localDoc);
        await setDoc(doc(dbFirestore!, 'documents', newDoc.id), firestoreDoc);
        console.log(`Uploaded document ${newDoc.id} to Firestore.`);
      });
    } catch (fsErr) {
      console.warn('Firestore write warning in createDocument:', fsErr);
    }

    runNeon(async (sql) => {
      try {
        const safeText = (newDoc.textContent || '').replace(/\0/g, '').replace(/\\u0000/g, '').slice(0, 400000);
        const safeFileData = (newDoc.fileData || '').replace(/\0/g, '').replace(/\\u0000/g, '');
        const safeSplitJson = JSON.stringify(newDoc.splitContent || []).replace(/\0/g, '').replace(/\\u0000/g, '');
        const safeDiagramsJson = JSON.stringify((newDoc as any).diagrams || []).replace(/\0/g, '').replace(/\\u0000/g, '');
        const safeName = (newDoc.name || '').replace(/\0/g, '').replace(/\\u0000/g, '');
        const safeCategory = (newDoc.category || '').replace(/\0/g, '').replace(/\\u0000/g, '');
        const summaryStr = typeof newDoc.summary === 'string' ? newDoc.summary : (newDoc.summary ? JSON.stringify(newDoc.summary) : '');
        const safeSummary = summaryStr.replace(/\0/g, '').replace(/\\u0000/g, '');
        await sql`
          INSERT INTO documents (id, name, category, size, page_count, summary, split_content, diagrams, download_url, file_key, created_at, bookmarked, text_content, file_data)
          VALUES (${newDoc.id}, ${safeName}, ${safeCategory}, ${newDoc.size || 0}, ${(newDoc as any).pageCount || 1}, ${safeSummary}, ${safeSplitJson}::jsonb, ${safeDiagramsJson}::jsonb, ${(newDoc as any).downloadUrl || null}, ${(newDoc as any).fileKey || null}, ${(newDoc as any).createdAt || new Date().toISOString()}, ${(newDoc as any).bookmarked ?? false}, ${safeText}, ${safeFileData || null})
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, summary = EXCLUDED.summary, split_content = EXCLUDED.split_content, diagrams = EXCLUDED.diagrams, file_key = EXCLUDED.file_key, download_url = EXCLUDED.download_url, text_content = EXCLUDED.text_content, file_data = EXCLUDED.file_data;
        `;
      } catch (sqlErr: any) {
        console.warn('Postgres document insertion notice:', sqlErr?.message || sqlErr);
      }
    });

    return localDoc;
  },
  updateDocument: async (id: string, updates: Partial<Document>) => {
    const data = loadDB();
    const idx = data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.fileData && sanitizedUpdates.fileData.length > 260000) {
        delete sanitizedUpdates.fileData;
      }
      data.documents[idx] = { ...data.documents[idx], ...sanitizedUpdates };
      saveDB(data);

      try {
        await runFirestore(async () => {
          const firestoreUpdates = prepareDocumentForFirestore(sanitizedUpdates);
          await setDoc(doc(dbFirestore!, 'documents', id), firestoreUpdates, { merge: true });
          console.log(`Updated document ${id} in Firestore.`);
        });
      } catch (fsErr) {
        console.warn('Firestore update warning in updateDocument:', fsErr);
      }

      runNeon(async (sql) => {
        const d = data.documents[idx];
        await sql`
          UPDATE documents 
          SET name = ${d.name}, summary = ${d.summary || ''}, bookmarked = ${d.bookmarked ?? false}, split_content = ${JSON.stringify(d.splitContent || [])}::jsonb, diagrams = ${JSON.stringify(d.diagrams || [])}::jsonb
          WHERE id = ${id};
        `;
      });

      return data.documents[idx];
    }
    return null;
  },
  deleteDocument: async (id: string) => {
    const data = loadDB();
    data.documents = data.documents.filter(d => d.id !== id);
    data.quizzes = data.quizzes.filter(q => q.docId !== id);
    data.flashcards = data.flashcards.filter(f => f.docId !== id);
    saveDB(data);

    await runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'documents', id));
      console.log(`Deleted document ${id} from Firestore.`);
    });

    runNeon(async (sql) => {
      await sql`DELETE FROM documents WHERE id = ${id};`;
    });
  },

  clearAllDocuments: async () => {
    const data = loadDB();
    
    await runFirestore(async () => {
      const snapshot = await getDocs(collection(dbFirestore!, 'documents'));
      if (!snapshot.empty) {
        const batch = writeBatch(dbFirestore!);
        snapshot.docs.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        console.log('Cleared all documents from Firestore.');
      }
    });

    data.documents = [];
    data.quizzes = [];
    data.flashcards = [];
    saveDB(data);
    console.log('Cleared all local documents, quizzes, and flashcards.');
  },

  resetCurriculum: async () => {
    const data = loadDB();
    
    // 1. Clear existing documents in Firestore if enabled
    await runFirestore(async () => {
      const snapshot = await getDocs(collection(dbFirestore!, 'documents'));
      if (!snapshot.empty) {
        const batch = writeBatch(dbFirestore!);
        snapshot.docs.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    });

    // 2. Set default documents locally
    data.documents = JSON.parse(JSON.stringify(DEFAULT_DB.documents));
    data.quizzes = [];
    data.flashcards = [];
    saveDB(data);

    // 3. Set default documents in Firestore if enabled
    await runFirestore(async () => {
      for (const d of data.documents) {
        const clean = { ...d };
        if (clean.fileData && clean.fileData.length > 200000) delete clean.fileData;
        await setDoc(doc(dbFirestore!, 'documents', d.id), clean);
      }
    });

    console.log('Successfully reset curriculum material to default.');
    return data.documents;
  },

  // Chats
  getChatsByUser: (userId: string) => loadDB().chats.filter(c => c.userId === userId).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  getChatById: (id: string) => {
    const local = loadDB().chats.find(c => c.id === id);
    if (local) return local;
    return null;
  },
  createChat: (chat: ChatSession) => {
    const data = loadDB();
    data.chats.push(chat);
    saveDB(data);
    runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'chats', chat.id), chat);
    });
    runNeon(async (sql) => {
      await sql`
        INSERT INTO chats (id, user_id, title, doc_id, category, messages, created_at, updated_at)
        VALUES (${chat.id}, ${chat.userId}, ${chat.title}, ${chat.docId || null}, ${chat.category || null}, ${JSON.stringify(chat.messages || [])}::jsonb, ${chat.createdAt}, ${chat.updatedAt})
        ON CONFLICT (id) DO UPDATE SET messages = EXCLUDED.messages, updated_at = EXCLUDED.updated_at, title = EXCLUDED.title;
      `;
    });
    return chat;
  },
  updateChat: (id: string, updates: Partial<ChatSession>) => {
    const data = loadDB();
    const idx = data.chats.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.chats[idx] = { ...data.chats[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDB(data);
      runFirestore(async () => {
        await setDoc(doc(dbFirestore!, 'chats', id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      });
      runNeon(async (sql) => {
        await sql`
          UPDATE chats 
          SET messages = ${JSON.stringify(data.chats[idx].messages || [])}::jsonb, 
              title = ${data.chats[idx].title},
              updated_at = ${data.chats[idx].updatedAt}
          WHERE id = ${id};
        `;
      });
      return data.chats[idx];
    }
    return null;
  },
  deleteChat: (id: string) => {
    const data = loadDB();
    data.chats = data.chats.filter(c => c.id !== id);
    saveDB(data);
    runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'chats', id));
    });
    runNeon(async (sql) => {
      await sql`DELETE FROM chats WHERE id = ${id};`;
    });
  },

  // Quizzes
  getQuizzes: () => loadDB().quizzes,
  getQuizById: (id: string) => loadDB().quizzes.find(q => q.id === id),
  createQuiz: (quiz: Quiz) => {
    const data = loadDB();
    data.quizzes.push(quiz);
    saveDB(data);
    runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'quizzes', quiz.id), quiz);
    });
    runNeon(async (sql) => {
      await sql`
        INSERT INTO quizzes (id, title, category, doc_id, questions, created_at)
        VALUES (${quiz.id}, ${quiz.title}, ${quiz.category}, ${quiz.docId || null}, ${JSON.stringify(quiz.questions || [])}::jsonb, ${quiz.createdAt})
        ON CONFLICT (id) DO UPDATE SET questions = EXCLUDED.questions, title = EXCLUDED.title;
      `;
    });
    return quiz;
  },

  // Flashcards
  getFlashcardsByUser: (userId: string) => loadDB().flashcards.filter(f => f.userId === userId),
  createFlashcard: (fc: Flashcard) => {
    const data = loadDB();
    data.flashcards.push(fc);
    saveDB(data);
    runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'flashcards', fc.id), fc);
    });
    runNeon(async (sql) => {
      await sql`
        INSERT INTO flashcards (id, user_id, doc_id, category, question, answer, mastered, created_at)
        VALUES (${fc.id}, ${fc.userId || null}, ${fc.docId || null}, ${fc.category}, ${fc.front || ''}, ${fc.back || ''}, ${fc.isMastered ?? false}, ${fc.createdAt})
        ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question, answer = EXCLUDED.answer, mastered = EXCLUDED.mastered;
      `;
    });
    return fc;
  },
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => {
    const data = loadDB();
    const idx = data.flashcards.findIndex(f => f.id === id);
    if (idx !== -1) {
      data.flashcards[idx] = { ...data.flashcards[idx], ...updates };
      saveDB(data);
      runFirestore(async () => {
        await setDoc(doc(dbFirestore!, 'flashcards', id), updates, { merge: true });
      });
      runNeon(async (sql) => {
        const f = data.flashcards[idx];
        await sql`
          UPDATE flashcards 
          SET question = ${f.front || ''}, answer = ${f.back || ''}, mastered = ${f.isMastered ?? false}
          WHERE id = ${id};
        `;
      });
      return data.flashcards[idx];
    }
    return null;
  },
  deleteFlashcard: (id: string) => {
    const data = loadDB();
    data.flashcards = data.flashcards.filter(f => f.id !== id);
    saveDB(data);
    runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'flashcards', id));
    });
    runNeon(async (sql) => {
      await sql`DELETE FROM flashcards WHERE id = ${id};`;
    });
  },

  // Progress
  getProgressByUserId: (userId: string): StudentProgress => {
    const data = loadDB();
    let prg = data.progress.find(p => p.userId === userId);
    if (!prg) {
      prg = {
        userId,
        studiedModules: [],
        weakTopics: [],
        strongTopics: [],
        quizScores: [],
        aiUsageCount: 0,
        lastActive: new Date().toISOString()
      };
      data.progress.push(prg);
      saveDB(data);
    }
    return prg;
  },
  updateProgress: (userId: string, updates: Partial<StudentProgress>) => {
    const data = loadDB();
    const idx = data.progress.findIndex(p => p.userId === userId);
    let updated: StudentProgress;
    if (idx !== -1) {
      updated = { ...data.progress[idx], ...updates, lastActive: new Date().toISOString() };
      data.progress[idx] = updated;
    } else {
      updated = {
        userId,
        studiedModules: [],
        weakTopics: [],
        strongTopics: [],
        quizScores: [],
        aiUsageCount: 0,
        lastActive: new Date().toISOString(),
        ...updates
      };
      data.progress.push(updated);
    }
    saveDB(data);
    runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'progress', userId), sanitizeForFirestore(updated), { merge: true });
    });
    return updated;
  },
  incrementAiUsage: (userId: string) => {
    const data = loadDB();
    const idx = data.progress.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      data.progress[idx].aiUsageCount = (data.progress[idx].aiUsageCount || 0) + 1;
      saveDB(data);
      const nextCount = data.progress[idx].aiUsageCount;
      runFirestore(async () => {
        await setDoc(doc(dbFirestore!, 'progress', userId), { userId, aiUsageCount: nextCount, lastActive: new Date().toISOString() }, { merge: true });
      });
    } else {
      const created: StudentProgress = {
        userId,
        studiedModules: [],
        weakTopics: [],
        strongTopics: [],
        quizScores: [],
        aiUsageCount: 1,
        lastActive: new Date().toISOString()
      };
      data.progress.push(created);
      saveDB(data);
      runFirestore(async () => {
        await setDoc(doc(dbFirestore!, 'progress', userId), sanitizeForFirestore(created), { merge: true });
      });
    }
  },

  // Official Admin-Prepared Exams
  getExams: () => loadDB().exams || [],
  getExamById: (id: string) => (loadDB().exams || []).find(e => e.id === id),
  createExam: async (exam: OfficialExam) => {
    const data = loadDB();
    if (!data.exams) data.exams = [];
    data.exams.unshift(exam);
    saveDB(data);
    await runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'exams', exam.id), sanitizeForFirestore(exam));
    });
    return exam;
  },
  updateExam: async (id: string, updates: Partial<OfficialExam>) => {
    const data = loadDB();
    if (!data.exams) data.exams = [];
    const idx = data.exams.findIndex(e => e.id === id);
    if (idx === -1) return null;
    data.exams[idx] = { ...data.exams[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDB(data);
    await runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'exams', id), sanitizeForFirestore(data.exams[idx]), { merge: true });
    });
    return data.exams[idx];
  },
  deleteExam: async (id: string): Promise<boolean> => {
    const data = loadDB();
    const existed = (data.exams || []).some(e => e.id === id);
    if (!existed) return false;
    const removedSubs = (data.examSubmissions || []).filter(s => s.examId === id).map(s => s.id);
    const removedSessions = (data.examSessions || []).filter(s => s.examId === id).map(s => s.id);
    data.exams = (data.exams || []).filter(e => e.id !== id);
    data.examSubmissions = (data.examSubmissions || []).filter(s => s.examId !== id);
    data.examSessions = (data.examSessions || []).filter(s => s.examId !== id);
    saveDB(data);
    await runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'exams', id));
      for (const sid of removedSubs) {
        await deleteDoc(doc(dbFirestore!, 'exam_submissions', sid)).catch(() => {});
      }
      for (const sessId of removedSessions) {
        await deleteDoc(doc(dbFirestore!, 'exam_sessions', sessId)).catch(() => {});
      }
    });
    return true;
  },

  // Exam Sessions (server-anchored timer & tab-switch violation counter)
  getExamSessions: () => loadDB().examSessions || [],
  getExamSession: (examId: string, userId: string) =>
    (loadDB().examSessions || []).find(s => s.examId === examId && s.userId === userId),
  upsertExamSession: async (session: ExamSession) => {
    const data = loadDB();
    if (!data.examSessions) data.examSessions = [];
    const idx = data.examSessions.findIndex(s => s.id === session.id || (s.examId === session.examId && s.userId === session.userId));
    if (idx !== -1) {
      data.examSessions[idx] = { ...data.examSessions[idx], ...session };
    } else {
      data.examSessions.push(session);
    }
    saveDB(data);
    await runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'exam_sessions', session.id), sanitizeForFirestore(session), { merge: true });
    });
    return session;
  },

  // Exam Submissions
  getExamSubmissions: (examId?: string) => {
    const all = loadDB().examSubmissions || [];
    return examId ? all.filter(s => s.examId === examId) : all;
  },
  getExamSubmissionByUser: (examId: string, userId: string) =>
    (loadDB().examSubmissions || []).find(
      s => s.examId === examId && s.userId === userId && s.sourceType !== 'practice_quiz'
    ),
  createExamSubmission: async (sub: ExamSubmission) => {
    const data = loadDB();
    if (!data.examSubmissions) data.examSubmissions = [];
    const existingIdx = data.examSubmissions.findIndex(s =>
      s.id === sub.id ||
      (sub.sourceType !== 'practice_quiz' && s.sourceType !== 'practice_quiz' && s.examId === sub.examId && s.userId === sub.userId)
    );
    if (existingIdx !== -1) {
      data.examSubmissions[existingIdx] = sub;
    } else {
      data.examSubmissions.unshift(sub);
    }
    saveDB(data);
    await runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'exam_submissions', sub.id), sanitizeForFirestore(sub));
    });
    return sub;
  },
  deleteExamSubmission: async (subId: string): Promise<boolean> => {
    const data = loadDB();
    const target = (data.examSubmissions || []).find(s => s.id === subId);
    if (!target) return false;
    data.examSubmissions = (data.examSubmissions || []).filter(s => s.id !== subId);
    data.examSessions = (data.examSessions || []).filter(s => !(s.examId === target.examId && s.userId === target.userId));
    saveDB(data);
    await runFirestore(async () => {
      await deleteDoc(doc(dbFirestore!, 'exam_submissions', subId));
      await deleteDoc(doc(dbFirestore!, 'exam_sessions', `esess_${target.examId}_${target.userId}`)).catch(() => {});
    });
    return true;
  },

  // Master resets / clear data for debugging
  resetAll: () => {
    saveDB(DEFAULT_DB);
  }
};

export async function syncFromNeon() {
  await runNeon(async (sql) => {
    try {
      const users = (await sql`SELECT * FROM users;`) as any[];
      const documents = (await sql`SELECT * FROM documents;`) as any[];
      const chats = (await sql`SELECT * FROM chats;`) as any[];
      const quizzes = (await sql`SELECT * FROM quizzes;`) as any[];
      const flashcards = (await sql`SELECT * FROM flashcards;`) as any[];

      const localDB = loadDB();
      if (users && users.length > 0) {
        localDB.users = users.map((u: any) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          password: u.password,
          role: u.role,
          isVerified: u.is_verified,
          createdAt: u.created_at,
          avatar: u.avatar,
          resetToken: u.reset_token,
          resetExpires: u.reset_expires ? Number(u.reset_expires) : undefined
        }));
      }
      if (documents && documents.length > 0) {
        localDB.documents = documents.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type || 'pdf',
          size: Number(d.size),
          category: d.category,
          textContent: d.text_content || d.summary || '',
          uploadedAt: d.created_at || new Date().toISOString(),
          userId: d.user_id || 'usr_admin',
          bookmarks: [],
          pageCount: d.page_count,
          summary: d.summary,
          splitContent: typeof d.split_content === 'string' ? JSON.parse(d.split_content) : (d.split_content || []),
          diagrams: typeof d.diagrams === 'string' ? JSON.parse(d.diagrams) : (d.diagrams || []),
          downloadUrl: d.download_url,
          fileKey: d.file_key,
          fileData: d.file_data || undefined,
          createdAt: d.created_at,
          bookmarked: d.bookmarked
        }));
      }
      if (chats && chats.length > 0) {
        localDB.chats = chats.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          title: c.title,
          docId: c.doc_id,
          category: c.category,
          messages: typeof c.messages === 'string' ? JSON.parse(c.messages) : (c.messages || []),
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      }
      if (quizzes && quizzes.length > 0) {
        localDB.quizzes = quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          category: q.category,
          docId: q.doc_id,
          questions: typeof q.questions === 'string' ? JSON.parse(q.questions) : (q.questions || []),
          createdAt: q.created_at
        }));
      }
      if (flashcards && flashcards.length > 0) {
        localDB.flashcards = flashcards.map((f: any) => ({
          id: f.id,
          userId: f.user_id,
          docId: f.doc_id,
          category: f.category,
          front: f.question,
          back: f.answer,
          isMastered: f.mastered,
          createdAt: f.created_at
        }));
      }
      saveDB(localDB);
      console.log(`[Neon Postgres] Synced ${localDB.users.length} users, ${localDB.documents.length} docs, ${localDB.chats.length} chats.`);
    } catch (neonSyncErr: any) {
      console.warn('[Neon Postgres] syncFromNeon notice:', neonSyncErr?.message || neonSyncErr);
    }
  });
}

let lastFirestoreSyncAt = 0;
let activeFirestoreSync: Promise<void> | null = null;

function isJunkTestDocument(d: Partial<Document>): boolean {
  if (!d || !d.name) return true;
  const badNames = new Set([
    'package.json',
    'test_binary.pdf',
    'test_syllabus.pdf',
    'test_network_note.txt',
    'Firewall_Packet_Filtering_Guide.txt'
  ]);
  if (badNames.has(d.name)) return true;
  if (d.category === 'C Programming' && d.name.includes('Window Server')) return true;
  return false;
}

export async function syncDocumentsIfStale(maxAgeMs = 15000): Promise<void> {
  if (!firestoreEnabled || !dbFirestore) return;
  if (Date.now() - lastFirestoreSyncAt < maxAgeMs) return;
  if (activeFirestoreSync) {
    await activeFirestoreSync;
    return;
  }
  await syncFromFirestore();
}

export async function syncFromFirestore() {
  if (activeFirestoreSync) {
    await activeFirestoreSync;
    return;
  }
  activeFirestoreSync = (async () => {
    await runFirestore(async () => {
      console.log('[Firestore] Syncing documents with Firestore...');
      const snapshot = await getDocs(collection(dbFirestore!, 'documents'));
      const firestoreDocs: Document[] = [];
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          firestoreDocs.push(docSnap.data() as Document);
        });
      }

      const localDB = loadDB();
      const docMap = new Map<string, Document>();

      // 1. Load local documents first (skipping junk test docs)
      for (const d of localDB.documents || []) {
        if (d && d.id && !isJunkTestDocument(d)) {
          docMap.set(d.id, d);
        }
      }

      // 2. Merge Firestore documents (keep richer splitContent/textContent if present locally)
      for (const fd of firestoreDocs) {
        if (fd && fd.id) {
          if (isJunkTestDocument(fd)) {
            // Remove junk test docs from Firestore asynchronously
            deleteDoc(doc(dbFirestore!, 'documents', fd.id)).catch(() => {});
            continue;
          }
          const existing = docMap.get(fd.id);
          if (existing) {
            const merged: Document = { ...existing, ...fd };
            const existingClean = existing.splitContent && existing.splitContent.length > 0 && !hasBrokenCurriculumStubs(existing.splitContent);
            const fsBroken = hasBrokenCurriculumStubs(fd.splitContent);
            if (
              (existingClean && fsBroken) ||
              (existing.splitContent && existing.splitContent.length > (fd.splitContent?.length || 0) && !hasBrokenCurriculumStubs(existing.splitContent))
            ) {
              merged.splitContent = existing.splitContent;
            }
            if (existing.textContent && existing.textContent.length > (fd.textContent?.length || 0)) {
              merged.textContent = existing.textContent;
            }
            docMap.set(fd.id, merged);
          } else {
            docMap.set(fd.id, fd);
          }
        }
      }

      localDB.documents = Array.from(docMap.values());
      saveDB(localDB);
      lastFirestoreSyncAt = Date.now();
      console.log(`[Firestore] Successfully merged ${localDB.documents.length} total documents (Firestore had ${firestoreDocs.length}).`);

      // 3. Ensure any local documents not yet in Firestore, missing sections, or repaired locally get uploaded to Firestore
      for (const docItem of localDB.documents) {
        const inFs = firestoreDocs.find(f => f.id === docItem.id);
        const localIsClean = docItem.splitContent && docItem.splitContent.length > 0 && !hasBrokenCurriculumStubs(docItem.splitContent);
        const fsNeedsUpgrade = inFs && localIsClean && (
          !inFs.splitContent ||
          inFs.splitContent.length === 0 ||
          hasBrokenCurriculumStubs(inFs.splitContent) ||
          docItem.splitContent.length > inFs.splitContent.length ||
          ((docItem.textContent?.length || 0) > (inFs.textContent?.length || 0) + 5000 && (inFs.textContent?.length || 0) <= 200005)
        );
        if (!inFs || fsNeedsUpgrade) {
          try {
            const firestoreDoc = prepareDocumentForFirestore(docItem);
            await setDoc(doc(dbFirestore!, 'documents', docItem.id), firestoreDoc, { merge: true });
            console.log(`[Firestore] Synced clean doc to Firestore: ${docItem.id} (${docItem.name}, ${firestoreDoc.splitContent?.length || 0} sections)`);
          } catch (fsWriteErr: any) {
            console.warn(`[Firestore] Document sync notice for ${docItem.id}:`, fsWriteErr?.message || fsWriteErr);
          }
        }
      }

      // Seed and sync user profiles to Firestore so all users exist in Firestore
      try {
        if (localDB.users && Array.isArray(localDB.users)) {
          for (const u of localDB.users) {
            const cleanUser = { ...u };
            delete cleanUser.password;
            await setDoc(doc(dbFirestore!, 'users', u.id), cleanUser, { merge: true });
          }
          console.log(`[Firestore] Synced ${localDB.users.length} users to Firestore.`);
        }
      } catch (userSyncErr: any) {
        console.warn('[Firestore] User sync notice:', userSyncErr?.message || userSyncErr);
      }
    });
  })();

  try {
    await activeFirestoreSync;
  } finally {
    activeFirestoreSync = null;
  }
}

let lastAppCollectionsSyncAt = 0;
let activeAppCollectionsSync: Promise<void> | null = null;

export async function syncAppCollectionsIfStale(maxAgeMs = 15000): Promise<void> {
  if (!firestoreEnabled || !dbFirestore) return;
  if (Date.now() - lastAppCollectionsSyncAt < maxAgeMs) return;
  if (activeAppCollectionsSync) {
    await activeAppCollectionsSync;
    return;
  }
  activeAppCollectionsSync = (async () => {
    await runFirestore(async () => {
      const [quizSnap, fcSnap, chatSnap, progSnap, examSnap, examSubSnap, examSessSnap] = await Promise.all([
        getDocs(collection(dbFirestore!, 'quizzes')),
        getDocs(collection(dbFirestore!, 'flashcards')),
        getDocs(collection(dbFirestore!, 'chats')),
        getDocs(collection(dbFirestore!, 'progress')),
        getDocs(collection(dbFirestore!, 'exams')),
        getDocs(collection(dbFirestore!, 'exam_submissions')),
        getDocs(collection(dbFirestore!, 'exam_sessions'))
      ]);

      const localDB = loadDB();

      const mergeById = <T extends { id: string }>(localArr: T[], snap: any): T[] => {
        const map = new Map<string, T>();
        for (const item of localArr || []) {
          if (item?.id) map.set(item.id, item);
        }
        if (snap && !snap.empty) {
          snap.forEach((docSnap: any) => {
            const d = docSnap.data() as T;
            if (d?.id) map.set(d.id, d);
          });
        }
        return Array.from(map.values());
      };

      localDB.quizzes = mergeById(localDB.quizzes, quizSnap);
      localDB.flashcards = mergeById(localDB.flashcards, fcSnap);
      localDB.chats = mergeById(localDB.chats, chatSnap);
      localDB.exams = mergeById(localDB.exams || [], examSnap);
      localDB.examSubmissions = mergeById(localDB.examSubmissions || [], examSubSnap);
      localDB.examSessions = mergeById(localDB.examSessions || [], examSessSnap);

      if (progSnap && !progSnap.empty) {
        const progMap = new Map<string, StudentProgress>();
        for (const p of localDB.progress || []) {
          if (p?.userId) progMap.set(p.userId, p);
        }
        progSnap.forEach((docSnap: any) => {
          const fp = docSnap.data() as StudentProgress;
          const uid = fp?.userId || docSnap.id;
          if (uid) progMap.set(uid, { ...fp, userId: uid });
        });
        localDB.progress = Array.from(progMap.values());
      }

      saveDB(localDB);
      lastAppCollectionsSyncAt = Date.now();
    }, 8000);
  })();

  try {
    await activeAppCollectionsSync;
  } finally {
    activeAppCollectionsSync = null;
  }
}

// Trigger startup sync (skip eagerly blocking cold starts in serverless; routes await syncDocumentsIfStale)
if (!process.env.VERCEL) {
  syncFromNeon().then(() => syncFromFirestore()).catch(err => {
    console.error('Startup DB sync notice:', err);
  });
}

