import type { ChannelProfile, FetchOptions } from "../types";

export interface SocialPlatformAdapter {
  readonly platform: string;
  fetchProfile(accessToken: string, opts?: FetchOptions): Promise<ChannelProfile>;
}
