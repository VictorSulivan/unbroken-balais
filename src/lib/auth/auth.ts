import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "login",
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await prisma.utilisateur.findUnique({
          where: {
            username: credentials?.username as string,
          },
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
    async jwt({ token, user }) {
      // Au login, user est rempli → on copie dans le token
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.employeId = (user as any).employeId;
      }
      return token;
    },
    async session({ session, token }) {
      // On expose le token dans la session côté client/serveur
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).employeId = token.employeId;
      }
      return session;
    },
  },
});