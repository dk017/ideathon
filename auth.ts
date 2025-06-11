import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],

  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) token.accessToken = account.access_token;
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
}); 