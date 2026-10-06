import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decryptToken, encryptToken } from "../encryption";

let client: SupabaseClient | null = null;

/** Server-only client using the service-role key. Never import from client components. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars are not configured");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export interface TokenInput {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  scope?: string | null;
  expiresAt?: Date | null;
}

/** Encrypts, then upserts. Plaintext never reaches the database layer. */
export async function saveChannelToken(t: TokenInput, db: SupabaseClient = getSupabase()) {
  const row = {
    user_id: t.userId,
    provider: t.provider,
    access_token_enc: await encryptToken(t.accessToken),
    refresh_token_enc: t.refreshToken ? await encryptToken(t.refreshToken) : null,
    scope: t.scope ?? null,
    expires_at: t.expiresAt?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("channel_tokens").upsert(row, { onConflict: "user_id,provider" });
  if (error) throw new Error("Failed to store channel token");
}

export async function loadAccessToken(
  userId: string,
  provider: string,
  db: SupabaseClient = getSupabase(),
): Promise<string | null> {
  const { data, error } = await db
    .from("channel_tokens")
    .select("access_token_enc")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error("Failed to load channel token");
  return data ? decryptToken(data.access_token_enc) : null;
}

export async function deleteChannelToken(userId: string, provider: string, db: SupabaseClient = getSupabase()) {
  await db.from("channel_tokens").delete().eq("user_id", userId).eq("provider", provider);
}
