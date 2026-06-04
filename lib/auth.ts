import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByGoogleId, getUserByMicrosoftId, sql } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  // Share session cookie across .jktl.com.ng
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: "https://login.microsoftonline.com/common/v2.0",
    }),

    Credentials({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email as string);
        if (!user || !user.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!sql) return true; // Dev without DB

      try {
        if (account?.provider === "google") {
          const existing = await getUserByGoogleId(account.providerAccountId);
          if (existing) {
            await sql`UPDATE users SET last_login_at = NOW(), name = COALESCE(${user.name || null}, name), avatar = COALESCE(${user.image || null}, avatar) WHERE id = ${existing.id}`;
            user.id = existing.id;
            return true;
          }
          // Check by email
          const byEmail = await getUserByEmail(user.email!);
          if (byEmail) {
            await sql`UPDATE users SET google_id = ${account.providerAccountId}, last_login_at = NOW() WHERE id = ${byEmail.id}`;
            user.id = byEmail.id;
            return true;
          }
          // Create new user
          const rows = await sql`
            INSERT INTO users (email, name, avatar, google_id, email_verified, last_login_at)
            VALUES (${user.email!.toLowerCase()}, ${user.name || null}, ${user.image || null}, ${account.providerAccountId}, TRUE, NOW())
            RETURNING id
          `;
          user.id = rows[0].id;
          return true;
        }

        if (account?.provider === "microsoft-entra-id") {
          const existing = await getUserByMicrosoftId(account.providerAccountId);
          if (existing) {
            await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${existing.id}`;
            user.id = existing.id;
            return true;
          }
          const byEmail = await getUserByEmail(user.email!);
          if (byEmail) {
            await sql`UPDATE users SET microsoft_id = ${account.providerAccountId}, last_login_at = NOW() WHERE id = ${byEmail.id}`;
            user.id = byEmail.id;
            return true;
          }
          const rows = await sql`
            INSERT INTO users (email, name, avatar, microsoft_id, email_verified, last_login_at)
            VALUES (${user.email!.toLowerCase()}, ${user.name || null}, ${user.image || null}, ${account.providerAccountId}, TRUE, NOW())
            RETURNING id
          `;
          user.id = rows[0].id;
          return true;
        }

        // Credentials — update last login
        if (account?.provider === "credentials" && user.id) {
          await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;
        }

        return true;
      } catch (err) {
        console.error("SignIn callback error:", err);
        return true; // Don't block login on DB errors
      }
    },

    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/login",
    error:   "/login",
    verifyRequest: "/verify",
  },
});
