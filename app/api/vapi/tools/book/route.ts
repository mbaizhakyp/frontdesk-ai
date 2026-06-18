import { NextResponse } from "next/server";
import { createBooking } from "@/lib/calcom";
import { getTenantId, supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/twilio";

/**
 * Vapi "tool" the agent calls to book an appointment once the caller picks a time.
 * Body (from the agent's function call): { slug, name, phone, iso, service }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { slug = "demo-dental", name, phone, iso, service } = body;
  if (!phone || !iso) {
    return NextResponse.json({ result: "Missing phone or time." }, { status: 400 });
  }

  const { ok } = await createBooking({ slug, name, phone, iso, service });
  if (!ok) return NextResponse.json({ result: "Booking failed; take a message." });

  const tenantId = await getTenantId(slug);
  if (tenantId) {
    const db = supabaseAdmin();
    await db.from("appointments").insert({
      tenant_id: tenantId,
      name,
      caller_phone: phone,
      service,
      scheduled_for: iso,
      status: "booked",
      source: "ai_call",
    });
    const when = new Date(iso).toLocaleString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    });
    const confirm = `You're booked for ${when}. Reply here if you need to change it. See you soon!`;
    await sendSms(phone, confirm);
    await db.from("messages").insert({
      tenant_id: tenantId,
      direction: "outbound",
      to_phone: phone,
      body: confirm,
    });
  }

  return NextResponse.json({ result: "Appointment booked and confirmation texted." });
}
