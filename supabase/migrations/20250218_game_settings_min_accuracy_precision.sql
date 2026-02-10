-- Precision (çizim) oyunu için minimum isabet oranı; precision_trace oyunu kaydı
ALTER TABLE public.game_settings
ADD COLUMN IF NOT EXISTS min_accuracy int DEFAULT NULL CHECK (min_accuracy IS NULL OR (min_accuracy >= 0 AND min_accuracy <= 100));

COMMENT ON COLUMN public.game_settings.min_accuracy IS 'Çizim oyunu için gereken minimum isabet oranı (%). NULL = bu oyun isabet kullanmıyor.';

INSERT INTO public.game_settings (game_name, discount_rate, is_active, min_accuracy)
VALUES ('precision_trace', 10, true, 90)
ON CONFLICT (game_name) DO UPDATE SET
  discount_rate = EXCLUDED.discount_rate,
  is_active = EXCLUDED.is_active,
  min_accuracy = COALESCE(game_settings.min_accuracy, EXCLUDED.min_accuracy);
