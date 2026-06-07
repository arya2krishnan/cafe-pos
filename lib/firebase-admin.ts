import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is not set');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Cache the db instance — calling db.settings() more than once on the same
// Firestore instance throws "settings can no longer be changed".
let _db: admin.firestore.Firestore | null = null;

export function getDb() {
  if (_db) return _db;
  const app = getAdminApp();
  _db = admin.firestore(app);
  try {
    _db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Already set on a previous call — safe to ignore
  }
  return _db;
}

export function getStorage() {
  const app = getAdminApp();
  return admin.storage(app);
}

export function getAuth() {
  const app = getAdminApp();
  return admin.auth(app);
}

export function cafeRef(db: admin.firestore.Firestore, userId: string) {
  return db.collection('cafes').doc(userId);
}
