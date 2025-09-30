import type { UserRecord } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL ?? "admin@qualitydigital.global";
const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD ?? "QaManager!2024";
const DEFAULT_ADMIN_DISPLAY_NAME =
  process.env.DEFAULT_ADMIN_DISPLAY_NAME ?? "Administrador QA Manager";

let initializationPromise: Promise<void> | null = null;

async function initializeDefaultAdmin() {
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    console.warn(
      "DEFAULT_ADMIN_EMAIL ou DEFAULT_ADMIN_PASSWORD não configurados. Conta administrativa padrão não será criada."
    );
    return;
  }

  try {
    let adminUser: UserRecord | null = await adminAuth
      .getUserByEmail(DEFAULT_ADMIN_EMAIL)
      .catch((error: unknown) => {
        if (typeof error === "object" && error && "code" in error) {
          const code = (error as { code?: string }).code;
          if (code === "auth/user-not-found") {
            return null;
          }
        }
        throw error;
      });

    if (!adminUser) {
      adminUser = await adminAuth.createUser({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        displayName: DEFAULT_ADMIN_DISPLAY_NAME,
        emailVerified: true,
      });
    } else if (!adminUser.emailVerified || adminUser.displayName !== DEFAULT_ADMIN_DISPLAY_NAME) {
      adminUser = await adminAuth.updateUser(adminUser.uid, {
        emailVerified: true,
        displayName: DEFAULT_ADMIN_DISPLAY_NAME,
      });
    }

    await adminDb
      .collection("userRoles")
      .doc(adminUser.uid)
      .set(
        {
          role: "admin",
          email: DEFAULT_ADMIN_EMAIL,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  } catch (error) {
    console.error("Falha ao garantir conta administrativa padrão", error);
    throw error;
  }
}

export async function ensureDefaultAdmin() {
  if (!initializationPromise) {
    initializationPromise = initializeDefaultAdmin().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
}
