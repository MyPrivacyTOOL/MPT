# Working preferences for this repo

## Give solutions, not just problems

When a task hits a blocker that requires a manual step from a human (e.g. a
setting that has to be changed in a third-party UI, a connector that needs
re-authorization, a permission that has to be granted), do not just report
the blocker and stop. Always provide:

1. The exact link to where the change needs to be made (portal-specific
   where applicable — e.g. HubSpot URLs use the account's actual UI domain,
   such as `app-na2.hubspot.com`, not the generic `app.hubspot.com`).
2. Clear, numbered, step-by-step instructions for what to click/enter.
3. A precise statement of what you need back from the human to resume
   (e.g. "confirm it's done" or "tell me the new pipeline's internal ID").

This applies especially to HubSpot/CRM work in this repo, where the
available MCP tools cannot perform Settings-level actions (e.g. there is no
`PIPELINE` object type exposed — deal pipelines and stages must be created
manually in HubSpot Settings → Objects → Deals → Pipelines).

## HubSpot context (MyPrivacyTOOL CRM)

- **Canonical MPT HubSpot portal: 246502821** (account "MyPrivacyTOOL",
  myprivacytool@gmail.com, UI domain `app-na2.hubspot.com`). This is the
  portal documented in the project's own Notion infra record and is the
  ONLY one that counts for MPT CRM/GTM tasks.
- **245999072 ("KrispyKing", cransford@gmail.com) is a DIFFERENT, unrelated
  HubSpot account.** A Claude Code HubSpot MCP connector in this environment
  may default/authenticate to 245999072 rather than 246502821 — **always
  verify which portal ID a HubSpot tool call actually resolves to
  (`get_organization_details` / account-info) before creating or reading
  any record, and cross-check it against Notion, not against whatever the
  connector happens to be signed into.** Do not assume the connector is
  scoped to the right portal just because it's the only HubSpot connector
  available. On 2026-09-23 this mistake was made: 55 real company records
  were created in 245999072 by mistake and had to be disregarded/redone.
- As of 2026-06-15 (per the project's Notion infra record), portal
  246502821's HubSpot↔CF-Worker contact-sync integration was listed as
  "pending API key" — no Private App token had been configured. Check
  whether one now exists before assuming programmatic write access works;
  to create one: Settings → Integrations → Private Apps → Create, scope
  `crm.objects.contacts.write` (add companies/deals write scopes too as
  needed).
- MPC-6001 (formerly TID-6001 / MPC-098) — Enterprise GTM CRM setup task —
  was reopened 2026-09-22 after an audit found a prior closeout (10 CISO
  contacts, 10 enterprise deals, $1.31M pipeline) was never actually created
  in HubSpot. Do not trust prior closeout claims on this task without
  independently verifying record IDs/URLs in the CORRECT portal (246502821).
- **Never fabricate contact names, emails, or other personal data** to
  satisfy a task's acceptance criteria. Real people must come from a real
  data source (e.g. Sprouts Data Intelligence, once authorized). If no real
  data source is available, say so and stop rather than inventing records.
- Lead-stage definitions and acceptance-criteria checklist for MPC-6001 live
  in Notion: https://www.notion.so/3e428547eaa78135bcb5f7e94b9c92ea
  (now flagged at the top with the portal correction above).
