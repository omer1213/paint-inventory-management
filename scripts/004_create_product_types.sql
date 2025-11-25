create table if not exists public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_types_name on public.product_types (name);
