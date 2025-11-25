-- Increment stock atomically
create or replace function public.add_stock(p_code text, p_qty integer)
returns void
language plpgsql
security definer
as $$
begin
  if p_qty <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  update "products"
     set "quantity" = "quantity" + p_qty
   where "code" = p_code;

  if not found then
    raise exception 'Product % not found', p_code;
  end if;
end;
$$;

-- Record sale: verify stock, decrement, insert sale with current prices
create or replace function public.record_sale(
  p_product_code text,
  p_quantity_sold integer,
  p_packaging text
)
returns "sales"
language plpgsql
security definer
as $$
declare
  v_prod "products"%rowtype;
  v_sale "sales";
begin
  if p_quantity_sold <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select * into v_prod from "products" where "code" = p_product_code for update;
  if not found then
    raise exception 'Product % not found', p_product_code;
  end if;

  if v_prod."quantity" < p_quantity_sold then
    raise exception 'Insufficient stock for % (have %, need %)', p_product_code, v_prod."quantity", p_quantity_sold;
  end if;

  update "products"
     set "quantity" = v_prod."quantity" - p_quantity_sold
   where "code" = p_product_code;

  insert into "sales" (
    "productCode","name","packaging","quantitySold","sellingPrice","sourcingPrice"
  )
  values (
    v_prod."code", v_prod."name", coalesce(p_packaging, v_prod."packaging"), p_quantity_sold, v_prod."sellingPrice", v_prod."sourcingPrice"
  )
  returning * into v_sale;

  return v_sale;
end;
$$;
