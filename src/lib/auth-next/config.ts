/**
 * Auth.js (NextAuth v5) – YAPÓ 3.0
 * Login social (Google, Facebook, Instagram) + email/password.
 * Prisma adapter; sesión JWT para incluir role y compatibilidad con Credentials.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Instagram from "next-auth/providers/instagram";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { isMasterKeyProvided } from "@/lib/auth/dev/masterKey";
import type { RoleId } from "@/lib/auth";
import { isValidRoleId } from "@/lib/auth/roles";

const MASTER_KEY_USER_ID = "dev-master";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID ?? "",
      clientSecret: process.env.AUTH_FACEBOOK_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Instagram({
      clientId: process.env.AUTH_INSTAGRAM_ID ?? "",
      clientSecret: process.env.AUTH_INSTAGRAM_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
        masterKey: { label: "Master Key (dev)", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const masterKey = credentials?.masterKey as string | undefined;

        if (masterKey && isMasterKeyProvided(masterKey)) {
          return {
            id: MASTER_KEY_USER_ID,
            email: "dev@yapo.local",
            name: "Dev Master",
            role: "mbarete",
          };
        }

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        const role: string = isValidRoleId(user.role) ? user.role : "vale";
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "vale";
      }
      if (trigger === "update" && session) {
        token.role = (session as { role?: RoleId }).role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: RoleId }).role = (token.role as RoleId) ?? "vale";
      }
      return session;
    },
    async signIn({ user, account }) {
      if (user.id === MASTER_KEY_USER_ID) return true;
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;
      const provider = account?.provider ?? null;
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existing && provider) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: user.name ?? existing.name,
            image: user.image ?? existing.image,
            provider,
          },
        });
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id === MASTER_KEY_USER_ID) return;
      await prisma.profile.create({
        data: { userId: user.id, profileStatus: "INCOMPLETO" },
      });
    },
  },
});
