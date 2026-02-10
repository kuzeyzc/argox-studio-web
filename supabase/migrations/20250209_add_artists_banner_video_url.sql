-- Artists tablosuna banner_video_url sütunu ekler (profil sayfası üst banner video).
-- Supabase SQL Editor'da çalıştırın.

ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS banner_video_url text NOT NULL DEFAULT '';
