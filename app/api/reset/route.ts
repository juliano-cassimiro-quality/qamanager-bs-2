import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

const ACCOUNTS_COLLECTION = "browserstackAccounts";
const LOGS_COLLECTION = "accountLogs";

export async function POST() {
  try {
    const busySnapshot = await adminDb
      .collection(ACCOUNTS_COLLECTION)
      .where("status", "==", "busy")
      .get();

    if (busySnapshot.empty) {
      return NextResponse.json({ reset: 0, at: new Date().toISOString() });
    }

    const batch = adminDb.batch();
    const now = new Date().toISOString();

    const logPayloads = busySnapshot.docs.map((doc) => {
      const ref = doc.ref;
      batch.update(ref, {
        status: "free",
        owner: null,
        ownerId: null,
        lastReturnedAt: now,
      });

      return {
        accountId: doc.id,
        action: "checkin" as const,
        userId: "system-reset",
        userName: "Reset automático",
        email: null,
        timestamp: now,
      };
    });

    await batch.commit();

    await Promise.all(
      logPayloads.map(async (payload) => {
        await adminDb.collection(LOGS_COLLECTION).add(payload);
        await adminDb
          .collection(`${ACCOUNTS_COLLECTION}/${payload.accountId}/history`)
          .add(payload);
      })
    );

    return NextResponse.json({ reset: logPayloads.length, at: now });
  } catch (error) {
    console.error("Erro ao executar reset automático", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
