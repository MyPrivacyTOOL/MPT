import { Octokit } from "@octokit/rest";
import type { ChannelProfile, ChannelRepo, FetchOptions } from "../types";
import type { SocialPlatformAdapter } from "./base";

/** Subset of Octokit used here, so tests can inject a mock. */
export interface GitHubClient {
  users: { getAuthenticated(): Promise<{ data: any }> };
  repos: { listForAuthenticatedUser(p: any): Promise<{ data: any[] }> };
  activity: {
    listReposStarredByAuthenticatedUser(p: any): Promise<{ data: any[] }>;
    listEventsForAuthenticatedUser(p: any): Promise<{ data: any[] }>;
  };
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class GitHubAdapter implements SocialPlatformAdapter {
  readonly platform = "github";

  constructor(
    private makeClient: (token: string) => GitHubClient = (token) =>
      new Octokit({ auth: token }) as unknown as GitHubClient,
    private now: () => number = Date.now,
  ) {}

  async fetchProfile(accessToken: string, opts: FetchOptions = {}): Promise<ChannelProfile> {
    const gh = this.makeClient(accessToken);

    const [{ data: user }, { data: repos }, { data: starred }] = await Promise.all([
      gh.users.getAuthenticated(),
      // Only public repos: matches the minimum `public_repo` scope.
      gh.repos.listForAuthenticatedUser({ visibility: "public", per_page: 100, sort: "pushed" }),
      gh.activity.listReposStarredByAuthenticatedUser({ per_page: 50 }),
    ]);
    const { data: events } = await gh.activity.listEventsForAuthenticatedUser({
      username: user.login,
      per_page: 100,
    });

    const cutoff = this.now() - THIRTY_DAYS_MS;
    const recentActivityCount = events.filter(
      (e) => e.type === "PushEvent" && e.created_at && Date.parse(e.created_at) >= cutoff,
    ).length;

    // Explicit allow-list mapping: anything not copied here (email, location,
    // company, avatar, ids, urls) never leaves the adapter.
    const mappedRepos: ChannelRepo[] = repos
      .filter((r) => !r.private)
      .map((r) => ({
        name: String(r.name),
        language: r.language ?? null,
        topics: Array.isArray(r.topics) ? r.topics.map(String) : [],
        fork: Boolean(r.fork),
        pushedAt: r.pushed_at ?? null,
      }));

    return {
      platform: "github",
      login: String(user.login),
      displayName: opts.includeRealName ? (user.name ?? null) : null,
      bio: user.bio ?? null,
      publicRepoCount: Number(user.public_repos ?? mappedRepos.length),
      repos: mappedRepos,
      starredTopics: starred.flatMap((r) => (Array.isArray(r.topics) ? r.topics.map(String) : [])),
      recentActivityCount,
    };
  }
}
