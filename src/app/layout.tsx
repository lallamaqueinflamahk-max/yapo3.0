import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/lib/auth";
import { AuthSessionBridge } from "@/lib/auth-next/SessionBridge";
import { ConsentGuard } from "@/lib/auth-next/ConsentGuard";
import { ProfileGuard } from "@/lib/auth-next/ProfileGuard";
import { CerebroResultHandlerProvider } from "@/components/ui/CerebroResultHandler";
import Layout from "@/components/Layout";
import { ClientRenderLog } from "@/components/ClientRenderLog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "YAPÓ 3.0",
  description: "Plataforma de identidad, reputación y confianza",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "YAPÓ 3.0" },
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientRenderLog />
        <NextAuthSessionProvider>
          <SessionProvider>
            <AuthSessionBridge>
              <ConsentGuard>
                <ProfileGuard>
                  <CerebroResultHandlerProvider>
                    <Layout>{children}</Layout>
                  </CerebroResultHandlerProvider>
                </ProfileGuard>
              </ConsentGuard>
            </AuthSessionBridge>
          </SessionProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
