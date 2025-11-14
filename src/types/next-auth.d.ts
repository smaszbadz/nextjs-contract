// types.d.ts
import { DefaultSession } from "next-auth";

// เพิ่มการขยายประเภทสำหรับ NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      userID: string;
      username: string;
      name: string;
      email: string;
      roles: string[];
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    accessToken: string;
    refreshToken: string;
    roles: string[];
  }
}


// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}