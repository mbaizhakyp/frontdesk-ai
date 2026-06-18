import type { AgentConfig } from "@/lib/config";

/** Demo persona — a fictional Tuscaloosa HVAC company. The SAME app code
 *  serves this by config alone — proof of vertical-agnostic design. */
export const hvacConfig: AgentConfig = {
  slug: "demo-hvac",
  businessName: "Crimson Air Heating & Cooling",
  vertical: "hvac",
  phone: "",
  greeting:
    "Crimson Air Heating and Cooling, this is the front desk — how can I help?",
  hours: {
    Mon: "7:00–6:00",
    Tue: "7:00–6:00",
    Wed: "7:00–6:00",
    Thu: "7:00–6:00",
    Fri: "7:00–6:00",
    Sat: "8:00–12:00",
    Sun: "Emergency only",
  },
  services: [
    "AC repair & no-cool calls",
    "Heating repair",
    "New system installs & quotes",
    "Maintenance tune-ups",
    "Emergency service",
  ],
  faq: [
    { q: "My AC isn't working, how soon can you come?", a: "We can usually get a tech out same day or next morning — let me grab your details and the soonest window." },
    { q: "Do you give free quotes on a new system?", a: "Yes, new-system estimates are free. I'll schedule a time for a comfort advisor to come out." },
    { q: "What areas do you serve?", a: "Tuscaloosa, Northport, and the surrounding county." },
    { q: "Is there an after-hours fee?", a: "Emergency after-hours service has a trip fee; the technician will confirm before any work." },
  ],
  bookingRules: {
    slotMinutes: 120,
    leadTimeHours: 1,
    policy:
      "Offer the two soonest service windows. No-cool/no-heat calls are priority and get same-day if possible. Quote visits are 2-hour windows.",
  },
  voice: "default",
  reviewLink: "https://g.page/r/REPLACE_WITH_GOOGLE_REVIEW_LINK",
  avgJobValueCents: 35000,
};
