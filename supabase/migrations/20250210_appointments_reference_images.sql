-- Randevu referans görselleri: URL listesi (Supabase Storage'dan)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reference_image_urls jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.appointments.reference_image_urls IS 'Müşterinin yüklediği referans görsel URL listesi (Storage public URL).';
