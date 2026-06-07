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

export function getDb() {
  const app = getAdminApp();
  const db = admin.firestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

export function getStorage() {
  const app = getAdminApp();
  return admin.storage(app);
}

export function getAuth() {
  const app = getAdminApp();
  return admin.auth(app);
}

// Returns the Firestore subcollection root for a given userId
export function cafeRef(db: admin.firestore.Firestore, userId: string) {
  return db.collection('cafes').doc(userId);
}
