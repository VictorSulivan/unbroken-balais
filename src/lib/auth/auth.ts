import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        // TODO: Prisma check user
        return {
          id: "1",
          name: credentials?.username as string,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});