import NextAuth from "next-auth";
import { githubProvider } from "@/modules/oauth/providers/github";
import { saveChannelToken } from "@/modules/storage/supabase/client";
import { logError } from "@/modules/logging/logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [githubProvider],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Runs with `account` only at sign-in. Tokens go to encrypted storage, NOT the JWT/cookie.
      if (account?.provider === "github" && account.providerAccountId) {
        try {
          await saveChannelToken({
            userId: account.providerAccountId,
            provider: "github",
            accessToken: account.access_token!,
            refreshToken: account.refresh_token,
            scope: account.scope,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          });
          token.channelUserId = account.providerAccountId;
        } catch (e) {
          logError("channel_token_store_failed", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).channelUserId = token.channelUserId;
      return session;
    },
  },
});
