-- =====================================================
-- IMPORTANT: Apply this SQL in your Supabase Dashboard
-- =====================================================
-- Go to: https://qxgfyqxyvglmhactpqpo.supabase.co/project/_/sql
-- Copy and paste this entire file, then click "Run"
-- =====================================================

-- Step 1: Drop existing foreign key constraint from sales table
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_productCode_fkey";

-- Step 2: Drop the old primary key on products (only code)
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_pkey";

-- Step 3: Create new composite primary key (code + packaging)
ALTER TABLE "products" ADD PRIMARY KEY ("code", "packaging");

-- Step 4: Update sales table to include packaging in foreign key
ALTER TABLE "sales" 
  ADD CONSTRAINT "sales_product_fkey" 
  FOREIGN KEY ("productCode", "packaging") 
  REFERENCES "products"("code", "packaging") 
  ON DELETE RESTRICT;

-- Step 5: Update add_stock function to use code + packaging
CREATE OR REPLACE FUNCTION public.add_stock(
  p_code text, 
  p_packaging text,
  p_qty integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  UPDATE "products"
     SET "quantity" = "quantity" + p_qty
   WHERE "code" = p_code 
     AND "packaging" = p_packaging;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % (%) not found', p_code, p_packaging;
  END IF;
END;
$$;

-- Step 6: Update record_sale function to use code + packaging
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

  -- Find product by BOTH code and packaging
  SELECT * INTO v_prod 
  FROM "products" 
  WHERE "code" = p_product_code 
    AND "packaging" = p_packaging
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % (%) not found', p_product_code, p_packaging;
  END IF;

  IF v_prod."quantity" < p_quantity_sold THEN
    RAISE EXCEPTION 'Insufficient stock for % (%) - have %, need %', 
      p_product_code, p_packaging, v_prod."quantity", p_quantity_sold;
  END IF;

  -- Update stock for specific code + packaging combination
  UPDATE "products"
     SET "quantity" = v_prod."quantity" - p_quantity_sold
   WHERE "code" = p_product_code
     AND "packaging" = p_packaging;

  -- Use custom price if provided, otherwise use product's default selling price
  v_final_price := COALESCE(p_selling_price, v_prod."sellingPrice");

  INSERT INTO "sales" (
    "productCode","name","packaging","quantitySold","sellingPrice","sourcingPrice"
  )
  VALUES (
    v_prod."code", v_prod."name", v_prod."packaging", p_quantity_sold, v_final_price, v_prod."sourcingPrice"
  )
  RETURNING * INTO v_sale;

  RETURN v_sale;
END;
$$;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Now each product with same code but different packaging
-- will have its own separate stock tracking.
-- Example: NU16 Quarter has 5000, NU16 Balti has 8900
-- =====================================================
