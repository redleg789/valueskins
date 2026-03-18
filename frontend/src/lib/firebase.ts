import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

let app: FirebaseApp | null = null;
let database: Database | null = null;

function getFirebaseDb(): Database {
  if (database) return database;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skins-backend';
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
  app = initializeApp(config);
  database = getDatabase(app);
  return database;
}

// Proxy that lazily initializes — safe for SSR/prerendering
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    if (typeof window === 'undefined') return undefined;
    const realDb = getFirebaseDb();
    return (realDb as unknown as Record<string | symbol, unknown>)[prop];
  },
});
