import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "login",
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await prisma.utilisateur.findUnique({
          where: { username: credentials?.username as string },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials?.password as string,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: String(user.id),
          username: user.username,
          role: user.roleSite,
          employeId: String(user.employeId),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.employeId = user.employeId;
      }
      // JWT from before role was stored: refetch from DB
      if (!token.role && token.id) {
        const dbUser = await prisma.utilisateur.findUnique({
          where: { id: Number(token.id) },
          select: { roleSite: true, employeId: true },
        });
        if (dbUser) {
          token.role = dbUser.roleSite;
          if (!token.employeId) token.employeId = String(dbUser.employeId);
        }
      }
      return token;
    },
  },
});