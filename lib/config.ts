/**
 * Vertical-agnostic agent configuration. A tenant's business profile is DATA,
 * not code — the same app serves dental, HVAC, etc. by swapping this config.
 * `renderSystemPrompt` turns a config into the Vapi/Retell assistant prompt.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export interface BookingRules {
  slotMinutes: number;
  leadTimeHours: number;
  /** Human description of scheduling policy the agent should follow. */
  policy: string;
}

export interface AgentConfig {
  slug: string;
  businessName: string;
  vertical: "dental" | "hvac";
  phone: string;
  greeting: string;
  hours: Record<string, string>;
  services: string[];
  faq: FaqItem[];
  bookingRules: BookingRules;
  voice: string;
  reviewLink: string;
  /** For the dashboard "$ recovered" math. */
  avgJobValueCents: number;
}

export function renderSystemPrompt(c: AgentConfig): string {
  const hours = Object.entries(c.hours)
    .map(([d, h]) => `${d}: ${h}`)
    .join(", ");
  const faq = c.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n");
  return `You are the friendly front-desk receptionist for ${c.businessName}, a ${c.vertical} business.
Greeting: "${c.greeting}"

Your goals, in order:
1. Be warm, concise, and natural — like a great human receptionist.
2. Answer the caller's question using the facts below.
3. Capture the caller's name, phone number, and reason for calling.
4. If they want an appointment, use the check_availability tool, offer 2 specific times, then use the book_appointment tool.
5. If you cannot book (tool fails or it's a complex issue), take a clear message and promise a callback.

Business hours: ${hours}
Services: ${c.services.join(", ")}
Scheduling policy: ${c.bookingRules.policy}

Knowledge base:
${faq}

Never invent prices, insurance details, or medical/technical advice you don't have. If unsure, say you'll have the team follow up.`;
}
