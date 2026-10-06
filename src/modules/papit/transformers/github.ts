import { createHash } from "node:crypto";
import type { ChannelProfile } from "@/modules/channels/types";
import type { PaPITProfile } from "../schema";

const topN = (items: string[], n: number): string[] => {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k);
};

const ROLE_RULES: Array<[RegExp, string]> = [
  [/\b(devops|sre|infrastructure|platform)\b/i, "DevOps / Platform Engineer"],
  [/\b(security|infosec|pentest|appsec)\b/i, "Security Engineer"],
  [/\b(machine[- ]learning|ml|ai|data scien\w*)\b/i, "ML / Data Engineer"],
  [/\b(front[- ]?end|ui|react|css)\b/i, "Frontend Developer"],
  [/\b(back[- ]?end|api|server)\b/i, "Backend Developer"],
  [/\b(full[- ]?stack)\b/i, "Full-Stack Developer"],
  [/\b(mobile|ios|android)\b/i, "Mobile Developer"],
];

/** Strip emails/URLs/@handles from free text before using it for inference. */
export function scrubText(text: string | null): string {
  return (text ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/@\w+/g, "")
    .trim();
}

export function inferRole(bio: string | null, topics: string[]): string {
  const haystack = `${scrubText(bio)} ${topics.join(" ")}`;
  for (const [re, role] of ROLE_RULES) if (re.test(haystack)) return role;
  return "Software Developer";
}

export function activityLevel(pushEvents30d: number): "low" | "medium" | "high" {
  if (pushEvents30d >= 30) return "high";
  if (pushEvents30d >= 8) return "medium";
  return "low";
}

/** Canonical JSON (sorted keys) so the receipt hash is deterministic. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

/**
 * Output contains no login, name, email, bio text or repo names:
 * only aggregated, derived signals.
 */
export function githubToPaPIT(
  profile: ChannelProfile,
  now: () => Date = () => new Date(),
): PaPITProfile {
  const own = profile.repos.filter((r) => !r.fork);
  const body = {
    core_identity: {
      career: {
        skills: topN(own.map((r) => r.language).filter((l): l is string => !!l), 5),
        primary_role: inferRole(profile.bio, own.flatMap((r) => r.topics)),
        public_projects_count: profile.publicRepoCount,
      },
    },
    behavioral: {
      interests: topN(profile.starredTopics, 10),
      activity_level: activityLevel(profile.recentActivityCount),
    },
    privacy_boundaries: { data_retention_days: 30 as const, revocable: true as const },
  };

  const receipt = createHash("sha256").update(canonical(body)).digest("hex");

  return {
    version: "1.0",
    generated_at: now().toISOString(),
    source_channel: "github",
    cryptographic_receipt: receipt,
    ...body,
  };
}
