-- Update record_sale RPC to accept and store custom selling price
create or replace function public.record_sale(
  p_product_code text,
  p_quantity_sold integer,
  p_packaging text,
  p_selling_price numeric DEFAULT NULL
)
returns "sales"
language plpgsql
security definer
as $$
declare
  v_prod "products"%rowtype;
  v_sale "sales";
  v_final_price numeric;
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

  -- Use custom price if provided, otherwise use product's default selling price
  v_final_price := COALESCE(p_selling_price, v_prod."sellingPrice");

  insert into "sales" (
    "productCode","name","packaging","quantitySold","sellingPrice","sourcingPrice"
  )
  values (
    v_prod."code", v_prod."name", coalesce(p_packaging, v_prod."packaging"), p_quantity_sold, v_final_price, v_prod."sourcingPrice"
  )
  returning * into v_sale;

  return v_sale;
end;
$$;
