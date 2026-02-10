-- Sanatçı bütçe aralığı (TL): admin panelinde düzenlenir, randevu formunda gösterilir
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS min_budget int NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_budget int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.artists.min_budget IS 'Minimum tahmini bütçe (TL). 0 = belirtilmemiş.';
COMMENT ON COLUMN public.artists.max_budget IS 'Maksimum tahmini bütçe (TL). 0 = belirtilmemiş.';
