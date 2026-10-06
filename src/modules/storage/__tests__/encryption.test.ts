import { describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "../encryption";

const KEY = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
const OTHER = "ff".repeat(32);

describe("token encryption", () => {
  it("round-trips a token", async () => {
    const enc = await encryptToken("gho_secret_token", KEY);
    expect(await decryptToken(enc, KEY)).toBe("gho_secret_token");
  });

  it("never contains the plaintext and uses a fresh IV each time", async () => {
    const a = await encryptToken("gho_secret_token", KEY);
    const b = await encryptToken("gho_secret_token", KEY);
    expect(a).not.toContain("gho_secret_token");
    expect(a).not.toBe(b);
    expect(a.startsWith("v1.")).toBe(true);
  });

  it("fails with the wrong key", async () => {
    const enc = await encryptToken("x", KEY);
    await expect(decryptToken(enc, OTHER)).rejects.toThrow();
  });

  it("detects tampering (GCM auth tag)", async () => {
    const [v, iv, ct] = (await encryptToken("hello", KEY)).split(".");
    const flipped = (ct[0] === "A" ? "B" : "A") + ct.slice(1);
    await expect(decryptToken([v, iv, flipped].join("."), KEY)).rejects.toThrow();
  });

  it("rejects malformed keys and payloads", async () => {
    await expect(encryptToken("x", "short")).rejects.toThrow(/32-byte/);
    await expect(decryptToken("garbage", KEY)).rejects.toThrow(/format/);
  });
});
