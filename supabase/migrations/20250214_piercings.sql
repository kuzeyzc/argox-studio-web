-- Piercing tanıtım ve görselleme (takı + model fotoğrafları)
CREATE TABLE IF NOT EXISTS public.piercings (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  body_part text NOT NULL DEFAULT '',
  body_region text NOT NULL DEFAULT 'Kulak' CHECK (body_region IN ('Kulak', 'Burun', 'Dudak', 'Kaş', 'Dil', 'Göbek', 'Diğer')),
  material text NOT NULL DEFAULT '',
  product_image_url text NOT NULL DEFAULT '',
  model_image_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.piercings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for piercings" ON public.piercings;
CREATE POLICY "Allow all for piercings" ON public.piercings FOR ALL USING (true) WITH CHECK (true);
