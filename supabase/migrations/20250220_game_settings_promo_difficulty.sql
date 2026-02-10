-- Oyun başına indirim kodu ve zorluk hedefi (isabet/benzerlik %)
ALTER TABLE public.game_settings
ADD COLUMN IF NOT EXISTS promo_code text NOT NULL DEFAULT '';

ALTER TABLE public.game_settings
ADD COLUMN IF NOT EXISTS difficulty_target int DEFAULT 90 CHECK (difficulty_target IS NULL OR (difficulty_target >= 0 AND difficulty_target <= 100));

COMMENT ON COLUMN public.game_settings.promo_code IS 'Oyun kazanıldığında verilecek indirim kodu (örn. TATTOO15, INKMIX10).';
COMMENT ON COLUMN public.game_settings.difficulty_target IS 'Kazanmak için gereken isabet/benzerlik oranı (%).';

UPDATE public.game_settings SET promo_code = 'TATTOO2024', difficulty_target = COALESCE(difficulty_target, 100) WHERE game_name = 'memory_cards';
UPDATE public.game_settings SET promo_code = COALESCE(NULLIF(TRIM(promo_code), ''), 'TATTOO15'), difficulty_target = COALESCE(difficulty_target, min_accuracy, 90) WHERE game_name = 'precision_trace';
UPDATE public.game_settings SET promo_code = COALESCE(NULLIF(TRIM(promo_code), ''), 'INKMIX10'), difficulty_target = COALESCE(difficulty_target, 95) WHERE game_name = 'ink_mix_master';
