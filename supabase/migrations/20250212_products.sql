-- Tasarım Ürünler (Kıyafet ve Aksesuar) koleksiyonu
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Kıyafet' CHECK (category IN ('Kıyafet', 'Aksesuar')),
  stock_status text NOT NULL DEFAULT 'Var' CHECK (stock_status IN ('Var', 'Yok')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for products" ON public.products;
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
