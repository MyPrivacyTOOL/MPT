import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GitHubAdapter } from "@/modules/channels/adapters/github";
import { TtlCache } from "@/modules/channels/cache";
import { githubToPaPIT } from "@/modules/papit/transformers/github";
import type { PaPITProfile } from "@/modules/papit/schema";
import { loadAccessToken } from "@/modules/storage/supabase/client";
import { logError, logEvent } from "@/modules/logging/logger";

export const runtime = "nodejs"; // self-hosted Node, not edge

const cache = new TtlCache<PaPITProfile>(); // 24h TTL
const adapter = new GitHubAdapter();

export async function GET() {
  const session = await auth();
  const userId = (session as any)?.channelUserId as string | undefined;
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const cached = cache.get(userId);
  if (cached) {
    logEvent("github_profile_cache_hit");
    return NextResponse.json(cached);
  }

  try {
    const token = await loadAccessToken(userId, "github");
    if (!token) return NextResponse.json({ error: "channel_not_connected" }, { status: 404 });

    const profile = await adapter.fetchProfile(token, { includeRealName: false });
    const papit = githubToPaPIT(profile);
    cache.set(userId, papit);
    logEvent("github_profile_generated");
    return NextResponse.json(papit);
  } catch (e) {
    logError("github_profile_failed", e);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
