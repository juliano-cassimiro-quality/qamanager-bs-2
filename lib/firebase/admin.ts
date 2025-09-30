import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.warn(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID não configurado. Firebase Admin pode falhar."
  );
}

function initializeFirebaseAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let credential: AppOptions["credential"] | undefined;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
    } catch (error) {
      console.error(
        "FIREBASE_SERVICE_ACCOUNT_KEY inválida. Firebase Admin não será inicializado.",
        error
      );
      return null;
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  } else {
    console.warn(
      "Credenciais do Firebase Admin não configuradas. Funcionalidades administrativas serão desativadas."
    );
    return null;
  }

  const options: AppOptions = { credential };

  if (projectId) {
    options.projectId = projectId;
  }

  return initializeApp(options);
}

const firebaseAdminApp = initializeFirebaseAdminApp();

export const adminDb: Firestore | null = firebaseAdminApp
  ? getFirestore(firebaseAdminApp)
  : null;
export const adminAuth: Auth | null = firebaseAdminApp ? getAuth(firebaseAdminApp) : null;
