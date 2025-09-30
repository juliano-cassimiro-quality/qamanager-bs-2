import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase/admin";

const INVITES_COLLECTION = "invites";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const [, token] = authHeader.split(" ");
    if (!token) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    const body = await request.json();
    const { label, inviteeEmail, expiresInHours, maxUses } = body ?? {};

    const now = new Date();
    const expiresAt = expiresInHours ? new Date(now.getTime() + Number(expiresInHours) * 60 * 60 * 1000) : null;
    const tokenId = crypto.randomUUID();

    await adminDb.collection(INVITES_COLLECTION).doc(tokenId).set({
      token: tokenId,
      label: label ?? null,
      inviteeEmail: inviteeEmail ?? null,
      createdAt: new Date().toISOString(),
      createdBy: decoded.uid,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      maxUses: maxUses ?? null,
      remainingUses: maxUses ?? null,
    });

    return NextResponse.json({ token: tokenId });
  } catch (error) {
    console.error("Erro ao criar convite", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
