export interface PaPITProfile {
  version: "1.0";
  generated_at: string; // ISO 8601
  source_channel: "github";
  cryptographic_receipt: string; // SHA-256 hex of the sanitized payload (see transformer)
  core_identity: {
    career: {
      skills: string[];
      primary_role: string;
      public_projects_count: number;
    };
  };
  behavioral: {
    interests: string[];
    activity_level: "low" | "medium" | "high";
  };
  privacy_boundaries: {
    data_retention_days: 30;
    revocable: true;
  };
}
