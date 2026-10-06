# PaPIT JSON schema v1.0

| Field | Type | Notes |
|---|---|---|
| `version` | `"1.0"` | |
| `generated_at` | ISO 8601 string | |
| `source_channel` | `"github"` | |
| `cryptographic_receipt` | hex SHA-256 | Hash of canonical (sorted-key) JSON of `core_identity`, `behavioral`, `privacy_boundaries` |
| `core_identity.career.skills` | `string[]` | Top 5 languages of non-fork public repos |
| `core_identity.career.primary_role` | `string` | Keyword inference from scrubbed bio + repo topics; default "Software Developer" |
| `core_identity.career.public_projects_count` | `number` | |
| `behavioral.interests` | `string[]` | Top 10 topics from starred repos |
| `behavioral.activity_level` | `low\|medium\|high` | Push events in last 30 days: <8 low, 8-29 medium, >=30 high |
| `privacy_boundaries` | `{data_retention_days: 30, revocable: true}` | |

Types: `src/modules/papit/schema.ts`.
