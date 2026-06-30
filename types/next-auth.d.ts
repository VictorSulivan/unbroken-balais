import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      employeId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: string;
    employeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: string;
    employeId?: string | null;
  }
}