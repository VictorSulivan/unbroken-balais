import { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [], // On laisse vide ici, géré dans le gros fichier auth.ts
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.employeId = token.employeId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;