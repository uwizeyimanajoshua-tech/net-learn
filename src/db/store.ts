import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { User, Document, ChatSession, Quiz, Flashcard, StudentProgress } from '../types.ts';
import { CATEGORIES } from '../types.ts';

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
    dbFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    firestoreEnabled = true;
    console.log('[Firestore] Initialized successfully with database:', firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn('[Firestore] No valid Firebase configuration found. Using local JSON store.');
  }
} catch (error) {
  console.warn('Firebase initialization skipped or failed. Using local storage.', error);
}

async function runFirestore<T>(op: () => Promise<T>): Promise<T | null> {
  if (!firestoreEnabled || !dbFirestore) return null;
  try {
    return await op();
  } catch (err: any) {
    const msg = err?.message || '';
    console.warn('Firestore operation notice:', msg);
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
  ]
};

// Helper to safely write and read store
function loadDB(): DatabaseSchema {
  try {
    if (process.env.VERCEL && !fs.existsSync(STORE_PATH)) {
      const rootStore = path.join(process.cwd(), 'db_store.json');
      if (fs.existsSync(rootStore)) {
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
      console.error('Error saving DB:', error, e);
    }
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
  },

  // Documents
  getDocuments: () => loadDB().documents,
  getDocumentById: (id: string) => loadDB().documents.find(d => d.id === id),
  createDocument: async (newDoc: Document) => {
    const data = loadDB();
    data.documents.push(newDoc);
    saveDB(data);

    await runFirestore(async () => {
      const firestoreDoc: any = { ...newDoc };
      if (firestoreDoc.fileData && firestoreDoc.fileData.length > 200000) {
        delete firestoreDoc.fileData;
      }
      await setDoc(doc(dbFirestore!, 'documents', newDoc.id), firestoreDoc);
      console.log(`Uploaded document ${newDoc.id} to Firestore.`);
    });

    return newDoc;
  },
  updateDocument: async (id: string, updates: Partial<Document>) => {
    const data = loadDB();
    const idx = data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      data.documents[idx] = { ...data.documents[idx], ...updates };
      saveDB(data);

      await runFirestore(async () => {
        const firestoreUpdates: any = { ...updates };
        if (firestoreUpdates.fileData && firestoreUpdates.fileData.length > 200000) {
          delete firestoreUpdates.fileData;
        }
        await setDoc(doc(dbFirestore!, 'documents', id), firestoreUpdates, { merge: true });
        console.log(`Updated document ${id} in Firestore.`);
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
  getChatById: (id: string) => loadDB().chats.find(c => c.id === id),
  createChat: (chat: ChatSession) => {
    const data = loadDB();
    data.chats.push(chat);
    saveDB(data);
    runFirestore(async () => {
      await setDoc(doc(dbFirestore!, 'chats', chat.id), chat);
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
    if (idx !== -1) {
      data.progress[idx] = { ...data.progress[idx], ...updates, lastActive: new Date().toISOString() };
      saveDB(data);
      return data.progress[idx];
    } else {
      const newPrg = {
        userId,
        studiedModules: [],
        weakTopics: [],
        strongTopics: [],
        quizScores: [],
        aiUsageCount: 0,
        lastActive: new Date().toISOString(),
        ...updates
      };
      data.progress.push(newPrg);
      saveDB(data);
      return newPrg;
    }
  },
  incrementAiUsage: (userId: string) => {
    const data = loadDB();
    const idx = data.progress.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      data.progress[idx].aiUsageCount = (data.progress[idx].aiUsageCount || 0) + 1;
      saveDB(data);
    }
  },

  // Master resets / clear data for debugging
  resetAll: () => {
    saveDB(DEFAULT_DB);
  }
};

export async function syncFromFirestore() {
  await runFirestore(async () => {
    console.log('[Firestore] Syncing documents from Firestore...');
    const snapshot = await getDocs(collection(dbFirestore!, 'documents'));
    if (!snapshot.empty) {
      const docs: Document[] = [];
      snapshot.forEach(docSnap => {
        docs.push(docSnap.data() as Document);
      });
      const localDB = loadDB();
      localDB.documents = docs;
      saveDB(localDB);
      console.log(`[Firestore] Successfully synced ${docs.length} documents from Firestore.`);
    } else {
      console.log('[Firestore] Firestore documents collection is empty. Seeding local database documents to Firestore...');
      const localDB = loadDB();
      if (!localDB.documents || localDB.documents.length === 0) {
        localDB.documents = JSON.parse(JSON.stringify(DEFAULT_DB.documents));
        saveDB(localDB);
      }
    }

    // Seed and sync user profiles to Firestore so all users exist in Firestore
    try {
      const localDB = loadDB();
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
}

// Trigger async sync on startup
syncFromFirestore().catch(err => {
  console.error('Startup Firestore sync notice:', err);
});
