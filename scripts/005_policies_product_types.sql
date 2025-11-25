alter table public.product_types enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_types' and policyname = 'product_types_select_all'
  ) then
    create policy product_types_select_all on public.product_types
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_types' and policyname = 'product_types_insert_all'
  ) then
    create policy product_types_insert_all on public.product_types
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_types' and policyname = 'product_types_update_all'
  ) then
    create policy product_types_update_all on public.product_types
      for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_types' and policyname = 'product_types_delete_all'
  ) then
    create policy product_types_delete_all on public.product_types
      for delete using (true);
  end if;
end $$;
