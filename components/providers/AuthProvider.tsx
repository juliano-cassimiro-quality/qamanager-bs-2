"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, onSnapshot } from "firebase/firestore";
import { firebaseAuth } from "@/lib/firebase/client";
import { firestore } from "@/lib/firebase/client";
import type { UserRole } from "@/lib/types";
import { mapFirebaseError } from "@/lib/firebase/errors";
import { useToast } from "@/components/providers/ToastProvider";

const ALLOWED_DOMAINS = ["qualitydigital.global", "acct.global"]; // Domains allowed to authenticate

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser?.email) {
        const emailDomain = firebaseUser.email.split("@").pop()?.toLowerCase();
        const isAllowed = emailDomain ? ALLOWED_DOMAINS.includes(emailDomain) : false;

        if (!isAllowed) {
          showToast({
            title: "Acesso negado",
            description: "Este e-mail não possui permissão para acessar a plataforma.",
            intent: "error",
          });
          void firebaseSignOut(firebaseAuth);
          setUser(null);
          setLoading(false);
          return;
        }

        if (!firebaseUser.emailVerified) {
          showToast({
            title: "Verificação pendente",
            description: "Confirme seu e-mail corporativo antes de continuar.",
            intent: "warning",
          });
          void firebaseSignOut(firebaseAuth);
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    const roleDoc = doc(firestore, "userRoles", user.uid);
    const unsubscribe = onSnapshot(
      roleDoc,
      (snapshot) => {
        const data = snapshot.data();
        if (data?.role === "admin" || data?.role === "user") {
          setRole(data.role as UserRole);
        } else {
          setRole("user");
        }
      },
      (error) => {
        console.error("Erro ao carregar papel do usuário", error);
        const handledError = mapFirebaseError(
          error,
          "Não foi possível carregar o perfil do usuário."
        );
        showToast({
          title: "Erro ao carregar permissões",
          description: handledError.message,
          intent: "error",
        });
        setRole("user");
      }
    );

    return () => {
      unsubscribe();
    };
  }, [showToast, user]);

  const ensureAllowedEmail = useCallback((email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const domain = trimmedEmail.split("@").pop();
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      throw new Error("Utilize um e-mail corporativo válido para acessar.");
    }
    return trimmedEmail;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const normalizedEmail = ensureAllowedEmail(email);
        const credentials = await signInWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password
        );
        if (!credentials.user.emailVerified) {
          await sendEmailVerification(credentials.user).catch(() => undefined);
          await firebaseSignOut(firebaseAuth);
          throw new Error(
            "Confirme seu e-mail antes de acessar. Um novo link de verificação foi enviado."
          );
        }
      } catch (error) {
        throw mapFirebaseError(error, "Não foi possível entrar. Tente novamente.");
      }
    },
    [ensureAllowedEmail]
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        const normalizedEmail = ensureAllowedEmail(email);
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password
        );
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        await sendEmailVerification(userCredential.user).catch(() => undefined);
        await firebaseSignOut(firebaseAuth);
      } catch (error) {
        if (error instanceof FirebaseError && error.code === "auth/operation-not-allowed") {
          throw new Error(
            "Criação automática de contas está desabilitada. Entre em contato com um administrador para obter acesso."
          );
        }
        throw mapFirebaseError(error, "Não foi possível criar a conta. Tente novamente.");
      }
    },
    [ensureAllowedEmail]
  );

  const sendPasswordReset = useCallback(
    async (email: string) => {
      try {
        const normalizedEmail = ensureAllowedEmail(email);
        await sendPasswordResetEmail(firebaseAuth, normalizedEmail);
      } catch (error) {
        throw mapFirebaseError(error, "Não foi possível enviar o e-mail de redefinição.");
      }
    },
    [ensureAllowedEmail]
  );

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      throw mapFirebaseError(error, "Não foi possível encerrar a sessão.");
    }
  }, []);

  const value = useMemo(
    () => ({ user, role, loading, signInWithEmail, registerWithEmail, sendPasswordReset, signOut }),
    [loading, registerWithEmail, role, sendPasswordReset, signInWithEmail, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }
  return context;
}
