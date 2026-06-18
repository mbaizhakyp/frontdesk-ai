import { NextResponse } from "next/server";
import { checkAvailability } from "@/lib/calcom";

/**
 * Vapi "tool" the agent calls mid-conversation to read open slots.
 * Configure this URL as a function/tool on the Vapi assistant.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = body?.slug ?? body?.assistant?.metadata?.slug ?? "demo-dental";
  const slots = await checkAvailability(slug);
  // Vapi expects a tool result; return human-readable options for the agent to speak.
  return NextResponse.json({
    result: slots.map((s) => s.label).join(", "),
    slots,
  });
}
