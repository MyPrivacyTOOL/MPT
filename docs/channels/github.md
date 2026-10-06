# GitHub channel

## Flow
```
Browser -> /api/auth/signin (GitHub, OAuth 2.0 + PKCE + state)
        -> GitHub consent (scopes: read:user user:email public_repo)
        -> /api/auth/callback/github
        -> jwt callback: AES-256-GCM encrypt tokens -> Supabase channel_tokens
           (session cookie holds only the GitHub account id, never tokens)
GET /api/channels/github/profile
        -> 24h in-memory cache? return
        -> load + decrypt token -> GitHubAdapter -> githubToPaPIT -> cache -> JSON
```

## Privacy
- Only public repos are read; email, location, company, avatar and URLs are never copied out of the adapter.
- Real name is excluded unless `includeRealName` is passed (the route never passes it).
- PaPIT output contains only aggregated signals (no login, name, bio text, repo names).
- Logs contain event names and error class names only.

## Rate limits
Authenticated REST: 5,000 requests/hour per user. One profile build uses 4 calls and is cached 24h per user
(in-memory; resets on restart; Redis planned in MPC-111).

## Rollback
Revert the commit, `DROP TABLE IF EXISTS channel_tokens;`, revoke test tokens in GitHub Developer Settings, remove env vars.
