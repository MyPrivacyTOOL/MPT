-- MPC-115: encrypted OAuth token storage for channel integrations.
-- access_token_enc / refresh_token_enc hold AES-256-GCM ciphertext ("v1.<iv>.<ct>"), never plaintext.
create table if not exists public.channel_tokens (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  provider          text not null,
  access_token_enc  text not null,
  refresh_token_enc text,
  scope             text,
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, provider),
  constraint access_token_is_ciphertext check (access_token_enc like 'v1.%'),
  constraint refresh_token_is_ciphertext check (refresh_token_enc is null or refresh_token_enc like 'v1.%')
);

-- RLS on with no policies: only the service-role key (server side) can read/write.
alter table public.channel_tokens enable row level security;

-- Rollback: DROP TABLE IF EXISTS public.channel_tokens;
