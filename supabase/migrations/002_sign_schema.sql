-- consent_templates
create table consent_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  title text not null,
  content text not null,
  is_required boolean default false,
  valid_days integer,
  created_at timestamptz default now()
);

-- consent_records
create table consent_records (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  template_id uuid references consent_templates(id),
  status text default 'unsent'
    check (status in ('unsent','sent','signed','expired')),
  token text unique,
  token_expires_at timestamptz,
  sent_at timestamptz,
  signed_at timestamptz,
  signature_data text,
  pdf_url text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
