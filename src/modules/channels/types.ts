/** Unified, platform-agnostic channel data (already minimised, no tokens). */
export interface ChannelRepo {
  name: string;
  language: string | null;
  topics: string[];
  fork: boolean;
  pushedAt: string | null;
}

export interface ChannelProfile {
  platform: string;
  login: string;
  /** Only populated when the user has not opted out of sharing it. */
  displayName: string | null;
  bio: string | null;
  publicRepoCount: number;
  repos: ChannelRepo[];
  starredTopics: string[];
  /** Commit/push events observed in the last 30 days. */
  recentActivityCount: number;
  // Raw fields the adapter must NOT forward downstream are intentionally absent
  // from this type (email, location, company, avatar, ...).
}

export interface FetchOptions {
  /** If false, real name is dropped. Defaults to false (privacy-first). */
  includeRealName?: boolean;
}
