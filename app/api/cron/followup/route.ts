import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/twilio";

/**
 * Speed-to-lead follow-up drip. Run via Vercel Cron (see vercel.json).
 * Finds "new" leads with no contact in the last 20 minutes and nudges them once.
 * Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  const { data: stale } = await db
    .from("leads")
    .select("id, tenant_id, name, phone")
    .eq("status", "new")
    .is("last_contacted_at", null)
    .lt("created_at", cutoff)
    .limit(50);

  let nudged = 0;
  for (const lead of stale ?? []) {
    const body = `Just following up from earlier — still happy to get you scheduled. What day works best?`;
    if (await sendSms(lead.phone, body)) {
      await db.from("leads").update({ status: "contacted", last_contacted_at: new Date().toISOString() }).eq("id", lead.id);
      await db.from("messages").insert({
        tenant_id: lead.tenant_id,
        direction: "outbound",
        to_phone: lead.phone,
        body,
        related_lead_id: lead.id,
      });
      nudged++;
    }
  }
  return NextResponse.json({ ok: true, nudged });
}
