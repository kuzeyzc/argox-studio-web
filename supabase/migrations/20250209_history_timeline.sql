-- Tarihçe sayfası için timeline tablosu (TarihcePage + Admin Tarihçe Yönetimi)
CREATE TABLE IF NOT EXISTS public.history_timeline (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  year text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0
);

-- Sıralama için index
CREATE INDEX IF NOT EXISTS history_timeline_order_index ON public.history_timeline (order_index);

-- RLS
ALTER TABLE public.history_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for history_timeline" ON public.history_timeline;
CREATE POLICY "Allow all for history_timeline" ON public.history_timeline FOR ALL USING (true) WITH CHECK (true);

-- 1. Eksik olan updated_at kolonunu ekleyelim
ALTER TABLE public.history_timeline 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Eğer id kolonu tam sayı (integer) değil de metin (text/uuid) ise ve çakışma oluyorsa diye kontrol edelim
-- (Loglarda 'h1' olarak göründüğü için id tipinin uyumlu olduğundan emin olalım)