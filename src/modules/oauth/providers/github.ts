import GitHub from "next-auth/providers/github";

/** Minimum scopes required by MPC-115. Do not widen without a task. */
export const GITHUB_SCOPES = "read:user user:email public_repo";

export const githubProvider = GitHub({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  authorization: { params: { scope: GITHUB_SCOPES } },
  checks: ["pkce", "state"],
});
