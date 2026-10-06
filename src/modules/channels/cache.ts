/** Minimal in-memory TTL cache (Redis deferred to MPC-111). Clock is injectable for tests. */
export const TTL_24H_MS = 24 * 60 * 60 * 1000;

export class TtlCache<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private ttlMs: number = TTL_24H_MS,
    private now: () => number = Date.now,
  ) {}

  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (this.now() >= hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V): void {
    this.store.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}
