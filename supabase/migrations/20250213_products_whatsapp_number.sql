-- Ürün bazında WhatsApp sipariş numarası (boşsa stüdyo iletişim numarası kullanılır)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '';
