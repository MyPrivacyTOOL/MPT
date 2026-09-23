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

- Live portal reachable from this repo's HubSpot connector: **245999072**
  ("KrispyKing", UI domain `app-na2.hubspot.com`, owner cransford@gmail.com).
- MPC-6001 (formerly TID-6001 / MPC-098) — Enterprise GTM CRM setup task —
  was reopened 2026-09-22 after an audit found a prior closeout (10 CISO
  contacts, 10 enterprise deals, $1.31M pipeline) was never actually created
  in HubSpot. Do not trust prior closeout claims on this task without
  independently verifying record IDs/URLs in HubSpot.
- **Never fabricate contact names, emails, or other personal data** to
  satisfy a task's acceptance criteria. Real people must come from a real
  data source (e.g. Sprouts Data Intelligence, once authorized). If no real
  data source is available, say so and stop rather than inventing records.
- Lead-stage definitions and acceptance-criteria checklist for MPC-6001 live
  in Notion: https://www.notion.so/3e428547eaa78135bcb5f7e94b9c92ea
