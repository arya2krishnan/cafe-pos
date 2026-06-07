import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase on the client side (not during SSR/build)
function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

const _app = getFirebaseApp();

export const app = _app;
export const auth = _app ? getAuth(_app) : (null as unknown as Auth);
export const db = _app ? getFirestore(_app) : (null as unknown as Firestore);
export const storage = _app ? getStorage(_app) : (null as unknown as FirebaseStorage);
