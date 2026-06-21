/**
 * Seed the demo tenants (dental + HVAC) and their agent configs into Supabase.
 * Run after applying schema.sql:  npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { dentalConfig } from "../config/dental";
import { hvacConfig } from "../config/hvac";
import type { AgentConfig } from "../lib/config";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const db = createClient(url, key, { auth: { persistSession: false } });

async function seed(c: AgentConfig) {
  const { data: tenant } = await db
    .from("tenants")
    .upsert({ slug: c.slug, name: c.businessName, vertical: c.vertical }, { onConflict: "slug" })
    .select("id")
    .single();
  if (!tenant) throw new Error(`failed to upsert tenant ${c.slug}`);

  await db.from("agent_configs").insert({
    tenant_id: tenant.id,
    business_name: c.businessName,
    greeting: c.greeting,
    hours: c.hours,
    services: c.services,
    faq: c.faq,
    booking_rules: c.bookingRules,
    voice: c.voice,
    review_link: c.reviewLink,
    avg_job_value_cents: c.avgJobValueCents,
  });
  console.log(`seeded ${c.slug} (${tenant.id})`);
}

async function main() {
  await seed(dentalConfig);
  await seed(hvacConfig);
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
