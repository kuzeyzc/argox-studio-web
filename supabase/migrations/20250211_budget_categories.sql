-- Min-Max bütçe yerine kategori bazlı bütçe: budget_categories tablosu ve appointments.budget_preference

-- 1) artists tablosundaki min_budget, max_budget kolonlarını kaldır (devre dışı bırak)
ALTER TABLE public.artists
DROP COLUMN IF EXISTS min_budget,
DROP COLUMN IF EXISTS max_budget;

-- 2) Bütçe kategorileri: her sanatçı kendi kategorilerini tanımlar (örn. "Küçük Boy: 1500-2500₺")
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id text NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_budget_categories_artist_id ON public.budget_categories (artist_id);

ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for budget_categories" ON public.budget_categories;
CREATE POLICY "Allow all for budget_categories" ON public.budget_categories FOR ALL USING (true) WITH CHECK (true);

-- 3) Randevuya seçilen bütçe kategorisi etiketi (label)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS budget_preference text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.appointments.budget_preference IS 'Müşterinin seçtiği bütçe kategorisi etiketi (budget_categories.label).';
