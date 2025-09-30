import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.warn("NEXT_PUBLIC_FIREBASE_PROJECT_ID não configurado. Firebase Admin pode falhar.");
}

const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
          ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
          : applicationDefault(),
        projectId,
      })
    : getApps()[0];

export const adminDb = getFirestore(firebaseAdminApp);
export const adminAuth = getAuth(firebaseAdminApp);
