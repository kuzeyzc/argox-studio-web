-- Piercing fiyat ve WhatsApp sipariş numarası
ALTER TABLE public.piercings
  ADD COLUMN IF NOT EXISTS price text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '';
