-- Oyunlaştırma: minigame ayarları (indirim oranı, aktif/pasif)
CREATE TABLE IF NOT EXISTS public.game_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL UNIQUE,
  discount_rate int NOT NULL DEFAULT 10 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.game_settings (game_name, discount_rate, is_active)
VALUES ('memory_cards', 10, true)
ON CONFLICT (game_name) DO NOTHING;

ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for game_settings" ON public.game_settings;
CREATE POLICY "Allow all for game_settings" ON public.game_settings FOR ALL USING (true) WITH CHECK (true);
