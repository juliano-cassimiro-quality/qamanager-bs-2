import { FirebaseOptions, initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Firebase config incompleto. Verifique o arquivo .env.local");
  }

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return getApp();
}

export const firebaseApp = createFirebaseApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
