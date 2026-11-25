import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { initializeFirestore, getFirestore, memoryLocalCache, setLogLevel, disableNetwork, enableNetwork, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress non-fatal internal Firestore SDK WARN fallback notices (e.g., BloomFilter hash count fallback)
setLogLevel('error');

// Initialize Firebase client instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database instance explicitly configured with forced HTTP long-polling (prevents 10s WebChannel hangs in proxies/iFrames) and fresh memory cache
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: memoryLocalCache(),
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let networkDisabledDueToTimeout = false;

export async function ensureFirestoreOnline() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }
  if (networkDisabledDueToTimeout) {
    try {
      await enableNetwork(db);
      networkDisabledDueToTimeout = false;
    } catch {
      return false;
    }
  }
  return true;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (networkDisabledDueToTimeout) {
      enableNetwork(db)
        .then(() => {
          networkDisabledDueToTimeout = false;
        })
        .catch(() => {});
    }
  });
}

// Error handler adhering to Firebase Integration standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection validation on boot as required by skill
export async function testConnection() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    console.warn('[Firebase] Browser is offline; skipping startup Firestore connection ping.');
    return;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;

  try {
    const pingPromise = getDocFromServer(doc(db, 'test', 'connection'))
      .then(() => ({ status: 'ok' as const }))
      .catch((err: any) => ({ status: 'error' as const, err }));

    const guardPromise = new Promise<{ status: 'timeout' }>((resolve) => {
      timeoutId = setTimeout(() => {
        timedOut = true;
        resolve({ status: 'timeout' });
      }, 8000);
    });

    const outcome = await Promise.race([pingPromise, guardPromise]);

    if (timeoutId) clearTimeout(timeoutId);

    if (outcome.status === 'timeout') {
      networkDisabledDueToTimeout = true;
      await disableNetwork(db).catch(() => {});
      console.warn('[Firebase] Cloud Firestore unreachable within 8s; operating via server API until connection recovers.');
      return;
    }

    if (outcome.status === 'error') {
      throw outcome.err;
    }

    console.log('[Firebase] Connected to Firestore database:', firebaseConfig.firestoreDatabaseId);
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (timedOut) return;
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline') || msg.includes('Could not reach Cloud Firestore backend')) {
      networkDisabledDueToTimeout = true;
      await disableNetwork(db).catch(() => {});
      console.warn('[Firebase] Client offline or Firestore unreachable; operating via server API.');
    } else {
      console.warn('[Firebase] Connection ping notice:', msg);
    }
  }
}
testConnection();

// Google Sign-In with popup, with fallback handling for restrictive environments
export async function authenticateWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (popupErr: any) {
    console.warn('[Firebase Auth] Popup notice:', popupErr.code, popupErr.message);
    throw popupErr;
  }
}

export { fbSignOut };
