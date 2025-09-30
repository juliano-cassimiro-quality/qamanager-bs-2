"use client";

import { collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/client";
import { Invite } from "@/lib/types";

const INVITES_COLLECTION = "invites";

export interface InviteVerificationResult {
  valid: boolean;
  inviteeEmail?: string;
  label?: string;
  message?: string;
}

export async function createInvite(params: {
  label?: string;
  inviteeEmail?: string;
  expiresAt?: Date | null;
  maxUses?: number;
  createdBy: string;
}) {
  const token = crypto.randomUUID();
  await setDoc(doc(collection(firestore, INVITES_COLLECTION), token), {
    token,
    label: params.label ?? null,
    inviteeEmail: params.inviteeEmail ?? null,
    createdAt: serverTimestamp(),
    createdBy: params.createdBy,
    expiresAt: params.expiresAt ? params.expiresAt.toISOString() : null,
    maxUses: params.maxUses ?? null,
    remainingUses: params.maxUses ?? null,
  });
  return { id: token, token };
}

export async function verifyInvite(token: string): Promise<InviteVerificationResult> {
  const inviteDoc = await getDoc(doc(collection(firestore, INVITES_COLLECTION), token));
  if (!inviteDoc.exists()) {
    return { valid: false, message: "Convite não encontrado" };
  }
  const data = inviteDoc.data() as Invite;
  if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "Convite expirado" };
  }
  if (data.remainingUses !== undefined && data.remainingUses !== null && data.remainingUses <= 0) {
    return { valid: false, message: "Convite sem usos disponíveis" };
  }
  return {
    valid: true,
    inviteeEmail: data.inviteeEmail,
    label: data.label,
  };
}

export async function consumeInvite(token: string) {
  const inviteRef = doc(collection(firestore, INVITES_COLLECTION), token);
  const inviteSnapshot = await getDoc(inviteRef);
  if (!inviteSnapshot.exists()) return;
  const data = inviteSnapshot.data() as Invite;
  if (data.remainingUses && data.remainingUses > 0) {
    await updateDoc(inviteRef, { remainingUses: data.remainingUses - 1 });
  }
}
