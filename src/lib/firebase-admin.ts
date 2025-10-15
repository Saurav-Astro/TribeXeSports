
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let adminInstance: typeof admin | null = null;

export function initializeAdmin() {
  if (admin.apps.length > 0) {
    if (!db) {
        db = admin.firestore();
    }
     if (!adminInstance) {
        adminInstance = admin;
    }
    return { admin: adminInstance, db };
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    db = admin.firestore();
    adminInstance = admin;
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
  
  return { admin: adminInstance, db };
}
