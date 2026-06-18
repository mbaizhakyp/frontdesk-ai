import type { AgentConfig } from "@/lib/config";

/** Demo persona — a fictional Tuscaloosa dental practice. */
export const dentalConfig: AgentConfig = {
  slug: "demo-dental",
  businessName: "Druid City Family Dental",
  vertical: "dental",
  phone: "",
  greeting:
    "Thanks for calling Druid City Family Dental, this is the front desk — how can I help you today?",
  hours: {
    Mon: "8:00–5:00",
    Tue: "8:00–5:00",
    Wed: "8:00–5:00",
    Thu: "8:00–5:00",
    Fri: "8:00–2:00",
    Sat: "Closed",
    Sun: "Closed",
  },
  services: [
    "New patient exams & cleanings",
    "Fillings & crowns",
    "Teeth whitening",
    "Emergency tooth pain",
    "Invisalign consults",
  ],
  faq: [
    { q: "Do you take new patients?", a: "Yes, we're accepting new patients and can usually see them within a week." },
    { q: "Do you take my insurance?", a: "We accept most major PPO plans; share your provider and we'll confirm before your visit." },
    { q: "Where are you located?", a: "We're in Tuscaloosa, near McFarland Boulevard. We'll text you the exact address with your confirmation." },
    { q: "I have a toothache, can I be seen today?", a: "We hold same-day emergency slots — let me get your details and find you the soonest time." },
  ],
  bookingRules: {
    slotMinutes: 60,
    leadTimeHours: 2,
    policy:
      "Offer the two soonest open slots during business hours. New-patient exams are 60 minutes. Emergencies get same-day priority.",
  },
  voice: "default",
  reviewLink: "https://g.page/r/REPLACE_WITH_GOOGLE_REVIEW_LINK",
  avgJobValueCents: 30000, // conservative per-visit; new-patient LTV is far higher
};
