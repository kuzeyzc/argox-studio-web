-- Mevcut artists tablosuna slug sütunu ekler (tablo zaten varsa).
-- Supabase SQL Editor'da bu dosyayı çalıştırın.

ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';

-- Türkçe karakterleri ASCII'ye çevirip slug üreten fonksiyon (backfill için)
CREATE OR REPLACE FUNCTION public.slugify_tr(t text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result text;
BEGIN
  result := lower(trim(t));
  result := replace(result, 'ı', 'i');
  result := replace(result, 'ğ', 'g');
  result := replace(result, 'ü', 'u');
  result := replace(result, 'ş', 's');
  result := replace(result, 'ö', 'o');
  result := replace(result, 'ç', 'c');
  result := replace(result, 'İ', 'i');
  result := replace(result, 'I', 'i');
  result := replace(result, 'Ğ', 'g');
  result := replace(result, 'Ü', 'u');
  result := replace(result, 'Ş', 's');
  result := replace(result, 'Ö', 'o');
  result := replace(result, 'Ç', 'c');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '[^a-z0-9-]', '', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  RETURN nullif(result, '');
END;
$$;

-- Mevcut satırlarda slug boşsa isimden üret
UPDATE public.artists
SET slug = coalesce(nullif(trim(slug), ''), public.slugify_tr(name), id)
WHERE slug = '' OR slug IS NULL;

-- Benzersizlik için boş olmayan slug'lar unique
CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_key ON public.artists (slug) WHERE slug <> '';

-- Yeni kayıtlar uygulama tarafından slug ile gönderilir; default '' güvenlik için kalır.
