import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAccountByEmail, sql } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },

  cookies: {
    sessionToken: {
      name: "jktl-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".jktl.com.ng" : undefined,
      },
    },
  },

  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const account = await getAccountByEmail(credentials.email as string);
        if (!account || !account.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password as string, account.password_hash);
        if (!valid) return null;
        return { id: account.id, name: account.name, email: account.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Check verified status from DB
        if (user.email && sql) {
          try {
            const rows = await sql`SELECT email_verified FROM jktl_accounts WHERE email = ${user.email} LIMIT 1`;
            token.emailVerified = Boolean(rows[0]?.email_verified ?? false);
          } catch { token.emailVerified = false; }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as { user: { emailVerified?: boolean } }).user.emailVerified = Boolean(token.emailVerified ?? false);
      }
      return session;
    },
  },

  pages: {
    signIn:  "/sign-in",
    signOut: "/sign-out",
    error:   "/sign-in",
  },
});
