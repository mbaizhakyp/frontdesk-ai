import { NextResponse } from "next/server";
import { getTenantId, supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/twilio";

/**
 * Component 2 — Speed-to-lead.
 * Web "request appointment" form POSTs here → lead stored → instant SMS fired.
 * Body: { slug, name, phone, reason }
 */
export async function POST(req: Request) {
  const { slug = "demo-dental", name, phone, reason } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  const tenantId = await getTenantId(slug);
  if (!tenantId) {
    return NextResponse.json({ error: "unknown tenant" }, { status: 404 });
  }

  const db = supabaseAdmin();
  const { data: lead } = await db
    .from("leads")
    .insert({ tenant_id: tenantId, name, phone, reason, source: "web_form", status: "new" })
    .select("id")
    .single();

  // Speed-to-lead: fire within seconds.
  const body = `Hi ${name ?? "there"}, thanks for reaching out! This is the team — want me to get you booked? Reply with a good day/time and we'll lock it in.`;
  await sendSms(phone, body);
  await db.from("messages").insert({
    tenant_id: tenantId,
    direction: "outbound",
    to_phone: phone,
    body,
    related_lead_id: lead?.id ?? null,
  });

  return NextResponse.json({ ok: true, leadId: lead?.id });
}
