# Reception Suite

AI front desk for local service businesses — answers calls and texts, books
appointments, follows up on every lead instantly, and shows the owner the revenue
it recovers. Multi-tenant and vertical-agnostic: a business is a config
(`config/dental.ts`, `config/hvac.ts`), not a fork of the code.

## Architecture

- **Next.js (App Router) on Vercel** — webhooks, tool endpoints, dashboard
- **Supabase (Postgres)** — calls, leads, appointments, messages
- **Vapi/Retell** — voice agent + telephony (rented, not built)
- **Twilio** — SMS (missed-call text-back, speed-to-lead, confirmations)
- **Cal.com** — booking (stubbed in `lib/calcom.ts` until first client)

## Endpoints

| Route | Purpose |
|---|---|
| `POST /api/vapi/events` | Call lifecycle webhook — logs calls, fires missed-call text-back |
| `POST /api/vapi/tools/check-availability` | Agent tool — read open slots |
| `POST /api/vapi/tools/book` | Agent tool — book + text confirmation |
| `POST /api/twilio/sms` | Inbound SMS webhook |
| `POST /api/lead` | Web form → lead + instant speed-to-lead text |
| `GET /api/cron/followup` | Drip follow-up for stale leads (Vercel cron) |
| `/dashboard` | The demo "wow" — calls, leads, bookings, $ recovered |

## Setup checklist

1. **Accounts:** create [Supabase](https://supabase.com), [Vapi](https://vapi.ai)
   (or [Retell](https://retellai.com)), [Twilio](https://twilio.com), [Cal.com](https://cal.com).
2. **Env:** `cp .env.example .env.local` and fill in keys.
3. **Database:** open the Supabase SQL editor → paste & run `supabase/schema.sql`.
4. **Seed demo tenants:** `npx tsx scripts/seed.ts` (creates the dental + HVAC demos).
5. **Run:** `npm run dev` → open `/dashboard`.
6. **Voice agent (Vapi):** create an assistant; set its system prompt from
   `renderSystemPrompt(dentalConfig)` (see `lib/config.ts`); add two tools pointing at
   your deployed `/api/vapi/tools/check-availability` and `/book`; set the server URL to
   `/api/vapi/events`; put `{ "slug": "demo-dental" }` in the assistant metadata. Buy a
   phone number and attach the assistant. **Call it — that's M1.**
7. **SMS:** set the Twilio number's messaging webhook to `/api/twilio/sms`. Start
   **A2P 10DLC registration now** (required before production texting; takes days–weeks).
8. **Deploy:** push to GitHub → import to Vercel → add the same env vars → the cron in
   `vercel.json` runs the follow-up drip automatically.

## Milestones (full spec in ../trustmrr-analyzer/prospects/product-spec.md)

- **M0 Setup** — this scaffold ✅
- **M1 Receptionist answers** — wire Vapi, call the number
- **M2 Booking** — connect Cal.com in `lib/calcom.ts`
- **M3 Text-back + speed-to-lead** — add Twilio creds; test the web form + missed call
- **M4 Dashboard** — add Supabase realtime for live updates
- **M5 2nd vertical** — already wired (`demo-hvac`); flip with config
- **M6 Reviews** — phase 2

## Compliance notes

- **A2P 10DLC** before production SMS; **TCPA** consent for outbound/marketing texts.
- Keep dental health details out of stored data (PHI/HIPAA); revisit a BAA if you scale dental.
- Verify webhook signatures (Vapi, Twilio) before trusting payloads — marked as TODOs in the routes.
