"use client";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  addDoc,
  limit,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";
import type { Account, AccountLog, AccountLogInput } from "@/lib/types";

const ACCOUNTS_COLLECTION = "browserstackAccounts";
const LOGS_COLLECTION = "accountLogs";

export function subscribeToAccounts(onUpdate: (accounts: Account[]) => void) {
  const accountsRef = collection(firestore, ACCOUNTS_COLLECTION);
  const q = query(accountsRef, orderBy("username", "asc"));
  return onSnapshot(q, (snapshot) => {
    const accounts: Account[] = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        username: data.username,
        email: data.email,
        password: data.password ?? null,
        status: (data.status ?? "free") as Account["status"],
        owner: data.owner ?? null,
        ownerId: data.ownerId ?? null,
        lastUsedAt: normalizeTimestamp(data.lastUsedAt),
        lastReturnedAt: normalizeTimestamp(data.lastReturnedAt),
      } satisfies Account;
    });
    onUpdate(accounts);
  });
}

function normalizeTimestamp(timestamp: unknown) {
  if (!timestamp) return null;
  // Firestore Timestamp
  if (typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp && typeof timestamp.toDate === "function") {
    return (timestamp.toDate() as Date).toISOString();
  }
  if (typeof timestamp === "string") {
    return timestamp;
  }
  return null;
}

export async function fetchAccountHistory(accountId: string) {
  const logsRef = collection(firestore, `${ACCOUNTS_COLLECTION}/${accountId}/history`);
  const q = query(logsRef, orderBy("timestamp", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      action: data.action,
      userId: data.userId,
      userName: data.userName,
      email: data.email,
      timestamp: normalizeTimestamp(data.timestamp),
    };
  });
}

export async function reserveAccount(accountId: string, user: { uid: string; displayName?: string | null; email?: string | null }) {
  const accountsRef = collection(firestore, ACCOUNTS_COLLECTION);
  const activeReservationQuery = query(accountsRef, where("ownerId", "==", user.uid));
  const activeReservationSnapshot = await getDocs(activeReservationQuery);
  const hasActiveReservation = activeReservationSnapshot.docs.some((docSnapshot) => {
    const data = docSnapshot.data();
    return (data.status ?? "free") === "busy";
  });
  if (hasActiveReservation) {
    throw new Error("Você já possui uma conta reservada. Libere-a antes de reservar outra.");
  }
  const accountRef = doc(firestore, ACCOUNTS_COLLECTION, accountId);
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    if (!snapshot.exists()) {
      throw new Error("Conta não encontrada");
    }
    const data = snapshot.data();
    if (data.status === "busy" && data.ownerId && data.ownerId !== user.uid) {
      throw new Error("Conta já está em uso");
    }
    transaction.update(accountRef, {
      status: "busy",
      owner: user.displayName ?? user.email ?? "Usuário",
      ownerId: user.uid,
      lastUsedAt: new Date().toISOString(),
    });
  });
  await logAccountAction({
    accountId,
    action: "checkout",
    userId: user.uid,
    userName: user.displayName,
    email: user.email,
  });
}

export async function releaseAccount(accountId: string, user: { uid: string; displayName?: string | null; email?: string | null }) {
  const accountRef = doc(firestore, ACCOUNTS_COLLECTION, accountId);
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(accountRef);
    if (!snapshot.exists()) {
      throw new Error("Conta não encontrada");
    }
    transaction.update(accountRef, {
      status: "free",
      owner: null,
      ownerId: null,
      lastReturnedAt: new Date().toISOString(),
    });
  });
  await logAccountAction({
    accountId,
    action: "checkin",
    userId: user.uid,
    userName: user.displayName,
    email: user.email,
  });
}

export async function createAccount(account: {
  username: string;
  email: string;
  password: string;
}) {
  const accountsRef = collection(firestore, ACCOUNTS_COLLECTION);
  await addDoc(accountsRef, {
    username: account.username,
    email: account.email,
    password: account.password,
    status: "free",
    owner: null,
    ownerId: null,
    lastUsedAt: null,
    lastReturnedAt: null,
    createdAt: serverTimestamp(),
  });
}

export async function logAccountAction({ accountId, action, userId, userName, email }: AccountLogInput) {
  const payload = {
    accountId,
    action,
    userId,
    userName: userName ?? null,
    email: email ?? null,
    timestamp: serverTimestamp(),
  };

  const logsRef = collection(firestore, LOGS_COLLECTION);
  await addDoc(logsRef, payload);
  const accountHistoryRef = collection(firestore, `${ACCOUNTS_COLLECTION}/${accountId}/history`);
  await addDoc(accountHistoryRef, payload);
}

export async function fetchRecentAccountLogs(limitCount = 50): Promise<AccountLog[]> {
  const logsRef = collection(firestore, LOGS_COLLECTION);
  const q = query(logsRef, orderBy("timestamp", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      accountId: data.accountId,
      action: data.action,
      userId: data.userId,
      userName: data.userName ?? null,
      email: data.email ?? null,
      timestamp: normalizeTimestamp(data.timestamp),
    } satisfies AccountLog;
  });
}
