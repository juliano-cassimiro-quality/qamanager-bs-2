import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ensureDefaultAdmin } from "@/lib/firebase/ensureDefaultAdmin";

export const metadata: Metadata = {
  title: "QA Manager BrowserStack",
  description: "Gerencie reservas de contas BrowserStack",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDefaultAdmin();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
