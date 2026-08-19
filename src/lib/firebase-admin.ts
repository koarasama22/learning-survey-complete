import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let adminDb: Firestore;

function getAdminApp() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
      throw new Error("Firebase Admin 環境変数が不足しています");
    }

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    app = getApps()[0];
  }
  return app;
}

export function getAdminDb() {
  if (!adminDb) {
    getAdminApp();
    adminDb = getFirestore();
  }
  return adminDb;
}
