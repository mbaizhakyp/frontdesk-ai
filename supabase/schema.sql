-- Reception Suite — data model (multi-tenant from day one)
-- Apply in the Supabase SQL editor.

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  vertical text not null,                 -- 'dental' | 'hvac' | ...
  created_at timestamptz not null default now()
);

create table if not exists agent_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  business_name text not null,
  phone text,
  greeting text,
  hours jsonb default '{}'::jsonb,         -- { mon: "8-5", ... }
  services jsonb default '[]'::jsonb,      -- ["AC repair", ...]
  faq jsonb default '[]'::jsonb,           -- [{ q, a }]
  booking_rules jsonb default '{}'::jsonb, -- { slotMinutes, leadTimeHours, ... }
  voice text default 'default',
  review_link text,
  avg_job_value_cents integer default 35000,
  created_at timestamptz not null default now()
);

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  caller_name text,
  caller_phone text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  transcript text,
  outcome text,                            -- 'booked' | 'message' | 'missed' | 'after_hours'
  recovered_value_cents integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text,
  phone text not null,
  source text,                             -- 'web_form' | 'missed_call' | ...
  reason text,
  status text not null default 'new',      -- 'new' | 'contacted' | 'booked' | 'lost'
  created_at timestamptz not null default now(),
  last_contacted_at timestamptz
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  name text,
  caller_phone text,
  service text,
  scheduled_for timestamptz,
  status text not null default 'booked',   -- 'booked' | 'completed' | 'no_show' | 'canceled'
  source text,                             -- 'ai_call' | 'web' | ...
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  direction text not null,                 -- 'inbound' | 'outbound'
  to_phone text,
  from_phone text,
  body text,
  related_lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  phone text,
  sent_at timestamptz not null default now(),
  review_landed_at timestamptz
);

create index if not exists idx_calls_tenant on calls(tenant_id, created_at desc);
create index if not exists idx_leads_tenant on leads(tenant_id, created_at desc);
create index if not exists idx_appts_tenant on appointments(tenant_id, scheduled_for desc);
create index if not exists idx_messages_tenant on messages(tenant_id, created_at desc);
