import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (service role — never import into client components).
 * Used by API routes to log calls/leads/messages.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Resolve a tenant id by slug (single-tenant demo for now). */
export async function getTenantId(slug: string): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
}
