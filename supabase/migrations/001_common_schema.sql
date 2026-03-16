-- organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  plan text default 'free',
  created_at timestamptz default now()
);

-- staff
create table staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  organization_id uuid references organizations(id),
  name text not null,
  role text default 'member',
  created_at timestamptz default now()
);

-- contacts（患者・顧客）
create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null,
  phone text,
  email text,
  internal_id text,
  tags text[],
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz default now()
);
