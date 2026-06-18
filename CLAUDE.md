@AGENTS.md

# Reception Suite — orientation for Claude

This file auto-loads each session. Read it, then `README.md`. (The line above imports
the Next.js 16 agent rules — heed them; this Next.js has breaking changes.)

## What this is
An **AI front desk for local service businesses** (Tuscaloosa, AL): answers calls
and texts 24/7, books appointments, instantly follows up on every lead, and shows the
owner the revenue recovered. Built by a solo technical founder (accelerated master's
student) bootstrapping it. GitHub: `mbaizhakyp/frontdesk-ai`. Local folder: `reception-suite`.

## Where the strategy lives
The product code is here; the **business strategy + research** is in the sibling repo
`../trustmrr-analyzer/prospects/`:
- `product-spec.md` — the PRD + milestones (source of truth for scope)
- `competition-and-positioning.md` — competitors, pricing, moat, ICP, buyer objections
- `dental-go-to-market.md` — the dental vertical GTM (offer, pricing, unit economics)
- `timeline.md` — build/legal/discovery/payments sequence
- `dso-email.md` — immigration (CPT/OPT) email draft
- `tuscaloosa-prospects.csv` — 84 scored local prospects

## Core product principles (don't violate)
1. **Compete on go-to-market, never product.** We rent the hard parts (Vapi/Retell voice,
   Twilio SMS, Cal.com booking) and win on local + in-person + done-for-you + bundle.
   Don't try to out-engineer funded competitors (Arini, Weave).
2. **Vertical is config, not code.** A business = an `AgentConfig` (`config/dental.ts`,
   `config/hvac.ts`). Same codebase serves any vertical. Keep it that way.
3. **Multi-tenant from day one.** All data keyed by `tenant_id`.
4. **The demo IS the product** — build for production, demo as a fake practice.

## Architecture (key files)
- `lib/config.ts` — `AgentConfig` type + `renderSystemPrompt()`
- `config/{dental,hvac}.ts` — demo personas
- `supabase/schema.sql` — data model; `scripts/seed.ts` seeds demo tenants
- `app/api/vapi/events` — call webhook (logs calls, missed-call text-back)
- `app/api/vapi/tools/{check-availability,book}` — agent tools
- `app/api/lead` — web form → speed-to-lead text
- `app/api/twilio/sms` — inbound SMS; `app/api/cron/followup` — drip
- `app/dashboard` — the "$ recovered" demo surface

## Status & what's next
- **M0 (scaffold) ✅, M1 (receptionist) wired but needs API keys.** Builds clean.
- External integrations are **stubbed** with correct shapes (Cal.com returns sample
  slots; webhook signature verification is a TODO).
- Next without keys: web lead-capture form page · realtime dashboard (M4) · real
  Cal.com calls in `lib/calcom.ts`.
- Next needing the founder: create Supabase/Vapi/Twilio/Cal.com accounts → fill
  `.env.local` → run schema + seed → wire the Vapi assistant → call the number.

## Constraints / gotchas
- **A2P 10DLC** registration required before production SMS (long lead time).
- **Immigration:** founder is on F-1. Building, demoing, customer discovery, LOIs, and
  forming an LLC need no authorization; **delivering paid work / taking payment needs
  CPT or OPT.** Don't build payment-collection flows as if revenue can start before that.
- Keep dental **PHI** out of stored data (HIPAA); revisit a BAA only if scaling dental.
- Verify Vapi/Twilio webhook signatures before trusting payloads.

## Working style
Use the **efficient-fable** pattern: delegate routine fan-out to subagents (the `Agent`
tool is pre-approved), keep judgment in the main thread, verify delegated claims.

## Run
`npm run dev` → `/dashboard`. `npm run build` to verify. `npx tsx scripts/seed.ts` to seed.
