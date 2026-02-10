-- Randevuya indirim kodu alanı (oyundan kazanılan kod)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS discount_code text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.appointments.discount_code IS 'Müşterinin girdiği indirim kodu (örn. oyunla kazanılan TATTOO2024).';
