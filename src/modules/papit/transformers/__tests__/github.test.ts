import { describe, expect, it } from "vitest";
import type { ChannelProfile } from "@/modules/channels/types";
import { activityLevel, githubToPaPIT, inferRole, scrubText } from "../github";

const base: ChannelProfile = {
  platform: "github",
  login: "octocat",
  displayName: "Real Name",
  bio: "Security engineer, mail me at me@example.com or https://evil.io @handle",
  publicRepoCount: 4,
  repos: [
    { name: "private-sounding-repo", language: "Go", topics: ["pentest"], fork: false, pushedAt: null },
    { name: "x", language: "Go", topics: [], fork: false, pushedAt: null },
    { name: "y", language: "Python", topics: [], fork: false, pushedAt: null },
    { name: "forked", language: "Java", topics: [], fork: true, pushedAt: null },
  ],
  starredTopics: ["privacy", "privacy", "crypto"],
  recentActivityCount: 10,
};
const fixed = () => new Date("2026-10-01T00:00:00Z");

describe("githubToPaPIT", () => {
  const out = githubToPaPIT(base, fixed);

  it("matches the PaPIT v1 shape", () => {
    expect(out.version).toBe("1.0");
    expect(out.source_channel).toBe("github");
    expect(out.generated_at).toBe("2026-10-01T00:00:00.000Z");
    expect(out.privacy_boundaries).toEqual({ data_retention_days: 30, revocable: true });
    expect(out.core_identity.career.skills).toEqual(["Go", "Python"]); // forks excluded
    expect(out.core_identity.career.public_projects_count).toBe(4);
    expect(out.behavioral.interests).toEqual(["privacy", "crypto"]);
    expect(out.behavioral.activity_level).toBe("medium");
  });

  it("strips PII: no login, name, email, bio text or repo names", () => {
    const json = JSON.stringify(out);
    for (const pii of ["octocat", "Real Name", "me@example.com", "evil.io", "@handle", "private-sounding-repo"]) {
      expect(json).not.toContain(pii);
    }
  });

  it("produces a deterministic 64-hex SHA-256 receipt that changes with content", () => {
    expect(out.cryptographic_receipt).toMatch(/^[0-9a-f]{64}$/);
    expect(githubToPaPIT(base, fixed).cryptographic_receipt).toBe(out.cryptographic_receipt);
    const changed = githubToPaPIT({ ...base, publicRepoCount: 5 }, fixed);
    expect(changed.cryptographic_receipt).not.toBe(out.cryptographic_receipt);
  });
});

describe("helpers", () => {
  it("scrubText removes emails, urls and handles", () => {
    expect(scrubText("hi a@b.co http://x.y @me")).toBe("hi");
  });
  it("inferRole", () => {
    expect(inferRole("I love DevOps", [])).toBe("DevOps / Platform Engineer");
    expect(inferRole(null, [])).toBe("Software Developer");
  });
  it("activityLevel thresholds", () => {
    expect([0, 8, 30].map(activityLevel)).toEqual(["low", "medium", "high"]);
  });
});
