import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./auth.config"; // Import du fichier léger

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // On propage la config de base
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
});