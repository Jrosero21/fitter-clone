// pages/api/auth/[...nextauth].ts
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";     // <-- swap to bcryptjs

import prisma from "@/libs/prismadb";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null; // -> 401
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.hashedPassword) {
            return null; // -> 401
          }

          const ok = await compare(credentials.password, user.hashedPassword);
          if (!ok) return null; // -> 401

          // Minimal user object
          return { id: user.id, name: user.name ?? null, email: user.email, image: user.image ?? null };
        } catch (err) {
          console.error("authorize error:", err);
          throw err; // truly unexpected -> 500 (but now we’ll see the log)
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) (session.user as any).id = token.id;
      return session;
    },
  },
};

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}

export const config = { runtime: "nodejs" };
