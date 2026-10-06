# MyPrivacyTOOL (MPT)

Next.js 14 (App Router, TypeScript) app, self-hosted on DigitalOcean + Coolify (no Vercel features).
`LeadCapture1` is a separate Cloudflare Worker snippet and is unrelated to this app.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in values; never commit secrets
npm run dev
npm test && npm run typecheck
```

### Environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App credentials |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` in dev |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project (service role is server-only) |
| `ENCRYPTION_KEY` | 32-byte hex for AES-256-GCM: `openssl rand -hex 32` |

### GitHub integration (MPC-115)

1. Create an OAuth App at https://github.com/settings/developers  
   Homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`.
2. Apply `src/modules/storage/supabase/migrations/20261001_create_channel_tokens.sql` to your Supabase project.
3. Sign in at `/api/auth/signin`, then `GET /api/channels/github/profile` returns the sanitized PaPIT JSON.

See [docs/channels/github.md](docs/channels/github.md) and [docs/papit/schema-v1.md](docs/papit/schema-v1.md).
