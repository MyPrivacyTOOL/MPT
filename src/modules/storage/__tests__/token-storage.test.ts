import { describe, expect, it } from "vitest";
import { loadAccessToken, saveChannelToken } from "../supabase/client";

process.env.ENCRYPTION_KEY = "11".repeat(32);

/** Fake Supabase capturing what would be written to the DB. */
function fakeDb() {
  const rows: any[] = [];
  const db: any = {
    from: () => ({
      upsert: async (row: any) => { rows.push(row); return { error: null }; },
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: rows[0] ?? null, error: null }) }) }) }),
    }),
  };
  return { db, rows };
}

describe("channel token storage", () => {
  it("stores only ciphertext (no plaintext tokens in the row)", async () => {
    const { db, rows } = fakeDb();
    await saveChannelToken({ userId: "1", provider: "github", accessToken: "gho_PLAINTEXT", refreshToken: "ghr_PLAINTEXT" }, db);
    const serialized = JSON.stringify(rows[0]);
    expect(serialized).not.toContain("PLAINTEXT");
    expect(rows[0].access_token_enc).toMatch(/^v1\./);
    expect(rows[0].refresh_token_enc).toMatch(/^v1\./);
  });

  it("round-trips through load", async () => {
    const { db } = fakeDb();
    await saveChannelToken({ userId: "1", provider: "github", accessToken: "gho_abc" }, db);
    expect(await loadAccessToken("1", "github", db)).toBe("gho_abc");
  });
});
