import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

const ACCOUNTS_COLLECTION = "browserstackAccounts";

interface BrowserStackSession {
  automation_session: {
    status: string;
    browser: string;
    os: string;
    os_version: string;
    build_name?: string;
    name?: string;
    user_name: string;
    started_at: string;
  };
}

export async function GET() {
  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

  if (!username || !accessKey) {
    return NextResponse.json(
      { message: "Credenciais da BrowserStack não configuradas" },
      { status: 500 }
    );
  }

  try {
    const accountsSnapshot = await adminDb.collection(ACCOUNTS_COLLECTION).get();
    const accounts = accountsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }));

    const authHeader = Buffer.from(`${username}:${accessKey}`).toString("base64");
    const response = await fetch("https://api.browserstack.com/automate/sessions.json?status=running&limit=100", {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      cache: "no-cache",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro BrowserStack", text);
      return NextResponse.json({ message: "Falha ao consultar BrowserStack" }, { status: 502 });
    }

    const sessions = (await response.json()) as BrowserStackSession[];
    const busyUsers = new Set(
      sessions
        .map((session) => session.automation_session?.user_name)
        .filter((userName): userName is string => Boolean(userName))
    );

    const batch = adminDb.batch();

    accounts.forEach((account) => {
      const isBusy = busyUsers.has(String(account.username ?? account.id));
      const ref = adminDb.collection(ACCOUNTS_COLLECTION).doc(account.id);
      batch.update(ref, {
        status: isBusy ? "busy" : "free",
        lastCheckedAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      updated: accounts.length,
      busyCount: busyUsers.size,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro na verificação automática", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
