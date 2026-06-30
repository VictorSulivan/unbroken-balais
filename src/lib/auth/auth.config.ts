import { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [], // On laisse vide ici, géré dans le gros fichier auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.employeId = user.employeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = typeof token.username === "string" ? token.username : "";
        session.user.role = typeof token.role === "string" ? token.role : "";
        session.user.employeId = typeof token.employeId === "string" ? token.employeId : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;