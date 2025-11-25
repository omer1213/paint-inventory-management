-- Fix record_sale function to match by BOTH code AND packaging
-- This ensures that when you sell "NU16 Balti", it only updates "NU16 Balti" quantity
-- and not "NU16 Gallon" quantity

CREATE OR REPLACE FUNCTION public.record_sale(
  p_product_code text,
  p_quantity_sold integer,
  p_packaging text,
  p_selling_price numeric DEFAULT NULL
)
RETURNS "sales"
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prod "products"%rowtype;
  v_sale "sales";
  v_final_price numeric;
BEGIN
  IF p_quantity_sold <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  -- FIXED: Match by BOTH code AND packaging
  SELECT * INTO v_prod 
  FROM "products" 
  WHERE "code" = p_product_code 
    AND "packaging" = p_packaging 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % with packaging % not found', p_product_code, p_packaging;
  END IF;

  IF v_prod."quantity" < p_quantity_sold THEN
    RAISE EXCEPTION 'Insufficient stock for % (%) - have %, need %', 
      p_product_code, p_packaging, v_prod."quantity", p_quantity_sold;
  END IF;

  -- FIXED: Update quantity matching by BOTH code AND packaging
  UPDATE "products"
  SET "quantity" = v_prod."quantity" - p_quantity_sold
  WHERE "code" = p_product_code 
    AND "packaging" = p_packaging;

  -- Use custom price if provided, otherwise use product's default selling price
  v_final_price := COALESCE(p_selling_price, v_prod."sellingPrice");

  INSERT INTO "sales" (
    "productCode", "name", "packaging", "quantitySold", "sellingPrice", "sourcingPrice"
  )
  VALUES (
    v_prod."code", 
    v_prod."name", 
    v_prod."packaging", 
    p_quantity_sold, 
    v_final_price, 
    v_prod."sourcingPrice"
  )
  RETURNING * INTO v_sale;

  RETURN v_sale;
END;
$$;
