import { describe, expect, it, vi } from "vitest";
import { GitHubAdapter, type GitHubClient } from "../github";
import { TtlCache, TTL_24H_MS } from "../../cache";

const NOW = Date.parse("2026-10-01T00:00:00Z");

function mockClient(): GitHubClient {
  return {
    users: {
      getAuthenticated: async () => ({
        data: {
          login: "octocat", name: "Real Name", email: "private@example.com",
          bio: "Backend dev", location: "Secret City", company: "Acme",
          public_repos: 3, avatar_url: "https://x/y.png",
        },
      }),
    },
    repos: {
      listForAuthenticatedUser: async () => ({
        data: [
          { name: "a", language: "TypeScript", topics: ["api"], fork: false, private: false, pushed_at: "2026-09-30T00:00:00Z" },
          { name: "secret", language: "Rust", topics: [], fork: false, private: true },
        ],
      }),
    },
    activity: {
      listReposStarredByAuthenticatedUser: async () => ({ data: [{ topics: ["privacy", "crypto"] }] }),
      listEventsForAuthenticatedUser: async () => ({
        data: [
          { type: "PushEvent", created_at: "2026-09-25T00:00:00Z" },
          { type: "PushEvent", created_at: "2026-01-01T00:00:00Z" }, // too old
          { type: "WatchEvent", created_at: "2026-09-26T00:00:00Z" },
        ],
      }),
    },
  };
}

describe("GitHubAdapter", () => {
  const adapter = new GitHubAdapter(() => mockClient(), () => NOW);

  it("drops private repos and only forwards allow-listed fields", async () => {
    const p = await adapter.fetchProfile("tok");
    expect(p.repos.map((r) => r.name)).toEqual(["a"]);
    const json = JSON.stringify(p);
    for (const leaked of ["private@example.com", "Secret City", "Acme", "avatar", "secret"]) {
      expect(json).not.toContain(leaked);
    }
  });

  it("omits the real name unless opted in", async () => {
    expect((await adapter.fetchProfile("t")).displayName).toBeNull();
    expect((await adapter.fetchProfile("t", { includeRealName: true })).displayName).toBe("Real Name");
  });

  it("counts only recent push events", async () => {
    expect((await adapter.fetchProfile("t")).recentActivityCount).toBe(1);
  });

  it("passes the token to the client factory", async () => {
    const factory = vi.fn(() => mockClient());
    await new GitHubAdapter(factory, () => NOW).fetchProfile("abc");
    expect(factory).toHaveBeenCalledWith("abc");
  });
});

describe("TtlCache (24h)", () => {
  it("expires entries after 24h using mocked time", () => {
    let t = 1_000;
    const c = new TtlCache<string>(TTL_24H_MS, () => t);
    c.set("k", "v");
    t += TTL_24H_MS - 1;
    expect(c.get("k")).toBe("v");
    t += 1;
    expect(c.get("k")).toBeUndefined();
  });
});
