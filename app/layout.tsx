import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "QA Manager BrowserStack",
  description: "Gerencie reservas de contas BrowserStack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
