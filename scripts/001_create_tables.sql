-- Enable required extensions
create extension if not exists "pgcrypto";

-- Products
create table if not exists "products" (
  "code" text primary key,
  "name" text not null,
  "type" text,
  "packaging" text not null,
  "quantity" integer not null default 0 check ("quantity" >= 0),
  "sourcingPrice" double precision not null default 0,
  "sellingPrice" double precision not null default 0
);

-- Sales
create table if not exists "sales" (
  "id" uuid primary key default gen_random_uuid(),
  "date" timestamptz not null default now(),
  "productCode" text not null references "products"("code") on delete restrict,
  "name" text not null,
  "packaging" text not null,
  "quantitySold" integer not null check ("quantitySold" > 0),
  "sellingPrice" double precision not null,
  "sourcingPrice" double precision not null
);

-- Helpful indexes
create index if not exists idx_sales_date on "sales" ("date" desc);
create index if not exists idx_sales_product on "sales" ("productCode");
