import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "@/lib/auth";
import { AuthSessionBridge } from "@/lib/auth-next/SessionBridge";
import { ConsentGuard } from "@/lib/auth-next/ConsentGuard";
import { ProfileGuard } from "@/lib/auth-next/ProfileGuard";
import { CerebroResultHandlerProvider } from "@/components/ui/CerebroResultHandler";
import Layout from "@/components/Layout";
import { ClientRenderLog } from "@/components/ClientRenderLog";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
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
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} font-sans antialiased`}
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
