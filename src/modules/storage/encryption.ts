/**
 * AES-256-GCM token encryption using the Web Crypto API.
 * Stored format: `v1.<base64url iv>.<base64url ciphertext+tag>`.
 */

const VERSION = "v1";
const IV_BYTES = 12;

const toB64 = (b: Uint8Array): string => Buffer.from(b).toString("base64url");
const fromB64 = (s: string): Uint8Array<ArrayBuffer> => new Uint8Array(Buffer.from(s, "base64url"));

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars)");
  }
  return new Uint8Array(Buffer.from(hex, "hex"));
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", hexToBytes(hexKey), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptToken(
  plaintext: string,
  hexKey: string = process.env.ENCRYPTION_KEY ?? "",
): Promise<string> {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return [VERSION, toB64(iv), toB64(new Uint8Array(ct))].join(".");
}

export async function decryptToken(
  payload: string,
  hexKey: string = process.env.ENCRYPTION_KEY ?? "",
): Promise<string> {
  const [version, iv, ct] = payload.split(".");
  if (version !== VERSION || !iv || !ct) throw new Error("Invalid encrypted token format");
  const key = await importKey(hexKey);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(iv) },
    key,
    fromB64(ct),
  );
  return new TextDecoder().decode(pt);
}
