alter table "products" enable row level security;
alter table "sales" enable row level security;

-- For demo: allow anon full access (you can replace with user-scoped policies when adding auth)
drop policy if exists "anon_products_full" on "products";
create policy "anon_products_full"
on "products"
for all
to anon
using (true)
with check (true);

drop policy if exists "anon_sales_full" on "sales";
create policy "anon_sales_full"
on "sales"
for all
to anon
using (true)
with check (true);
