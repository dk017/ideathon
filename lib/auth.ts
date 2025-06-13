import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Log environment variables
console.log("Auth Environment Variables:");
console.log("GITHUB_ID:", process.env.GITHUB_ID ? "Set" : "Not Set");
console.log("GITHUB_SECRET:", process.env.GITHUB_SECRET ? "Set" : "Not Set");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Not Set");

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    })
  ],

  pages: { 
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  
  session: { 
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60 
  },

  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: any; user: any }) {
      if (account) token.accessToken = account.access_token;
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const requireAuth = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
};