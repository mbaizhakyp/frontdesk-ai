import { NextResponse } from "next/server";
import { getTenantId, supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/twilio";

/**
 * Component 1 — AI Receptionist webhook.
 * Vapi/Retell POSTs call lifecycle events here. On end-of-call we log the call,
 * and if it was missed / after-hours with no booking, fire the text-back.
 *
 * TODO: verify the signing secret (VAPI_WEBHOOK_SECRET) before trusting payloads.
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const type: string = payload?.message?.type ?? payload?.type ?? "";

  // Vapi sends an "end-of-call-report" when a call finishes.
  if (type === "end-of-call-report" || type === "status-update") {
    const slug = payload?.assistant?.metadata?.slug ?? "demo-dental";
    const tenantId = await getTenantId(slug);
    if (!tenantId) return NextResponse.json({ ok: true });

    const call = payload?.message?.call ?? payload?.call ?? {};
    const customerPhone: string | undefined = call?.customer?.number;
    const transcript: string | undefined = payload?.message?.transcript;
    const endedReason: string | undefined = payload?.message?.endedReason;
    const booked = /book|scheduled|appointment confirmed/i.test(transcript ?? "");
    const outcome = booked ? "booked" : endedReason ? "message" : "missed";

    const db = supabaseAdmin();
    await db.from("calls").insert({
      tenant_id: tenantId,
      caller_phone: customerPhone,
      transcript,
      outcome,
      recovered_value_cents: booked ? 30000 : 0,
    });

    // Missed / no-booking → instant text-back (speed-to-lead from a call).
    if (!booked && customerPhone) {
      const body =
        "Sorry we missed you just now! This is the front desk — want me to get you booked? Reply here and I'll take care of it.";
      await sendSms(customerPhone, body);
      await db.from("messages").insert({
        tenant_id: tenantId,
        direction: "outbound",
        to_phone: customerPhone,
        body,
      });
      await db.from("leads").insert({
        tenant_id: tenantId,
        phone: customerPhone,
        source: "missed_call",
        status: "new",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
