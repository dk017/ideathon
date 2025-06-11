import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Log environment variables
console.log("Auth Environment Variables:");
console.log("GITHUB_ID:", process.env.GITHUB_ID ? "Set" : "Not Set");
console.log("GITHUB_SECRET:", process.env.GITHUB_SECRET ? "Set" : "Not Set");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Not Set");

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { auth, signIn, signOut } = NextAuth(authConfig);