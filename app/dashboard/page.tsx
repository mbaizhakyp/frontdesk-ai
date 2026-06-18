import { supabaseAdmin } from "@/lib/supabase";

/**
 * The "wow" surface for demos. Server-rendered now; add Supabase realtime
 * (client component) for live updates during M4.
 */
export const dynamic = "force-dynamic";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

async function safeCount(table: string, filter?: (q: any) => any): Promise<number> {
  try {
    let q = supabaseAdmin().from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Dashboard() {
  let recovered = 0;
  let calls = 0;
  let missed = 0;
  let leads = 0;
  let booked = 0;
  let configured = true;
  try {
    const db = supabaseAdmin();
    const { data } = await db.from("calls").select("recovered_value_cents");
    recovered = (data ?? []).reduce((s, r: any) => s + (r.recovered_value_cents ?? 0), 0);
    calls = await safeCount("calls");
    missed = await safeCount("calls", (q) => q.in("outcome", ["missed", "after_hours"]));
    leads = await safeCount("leads");
    booked = await safeCount("appointments", (q) => q.eq("status", "booked"));
  } catch {
    configured = false;
  }

  const tiles = [
    { label: "Revenue recovered", value: money(recovered), accent: true },
    { label: "Calls handled", value: calls },
    { label: "Missed / after-hours caught", value: missed },
    { label: "Leads captured", value: leads },
    { label: "Appointments booked", value: booked },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Reception Suite — Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Live view of what the AI front desk is catching.
      </p>

      {!configured && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Supabase isn&apos;t configured yet — fill <code>.env.local</code> and apply{" "}
          <code>supabase/schema.sql</code>. Tiles will populate once data flows.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-xl border p-5 ${
              t.accent ? "border-emerald-300 bg-emerald-50" : "border-neutral-200 bg-white"
            }`}
          >
            <div className="text-sm text-neutral-500">{t.label}</div>
            <div
              className={`mt-2 text-3xl font-bold ${
                t.accent ? "text-emerald-700" : "text-neutral-900"
              }`}
            >
              {t.value}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
