import { NextResponse } from "next/server";
import { getTenantId, supabaseAdmin } from "@/lib/supabase";

/**
 * Inbound SMS webhook (set as the Messaging webhook on your Twilio number).
 * Twilio posts application/x-www-form-urlencoded. We log the message; a fuller
 * version routes replies back into the AI for two-way conversation.
 *
 * TODO: validate the X-Twilio-Signature header before trusting requests.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const from = String(form.get("From") ?? "");
  const to = String(form.get("To") ?? "");
  const text = String(form.get("Body") ?? "");

  // Single-tenant demo: map by the Twilio number later; default for now.
  const tenantId = await getTenantId("demo-dental");
  if (tenantId) {
    await supabaseAdmin().from("messages").insert({
      tenant_id: tenantId,
      direction: "inbound",
      from_phone: from,
      to_phone: to,
      body: text,
    });
  }

  // Empty TwiML = received, no auto-reply (yet).
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}
