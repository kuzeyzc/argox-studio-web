-- Ink Mix Master (renk karıştırma/hız) oyunu
INSERT INTO public.game_settings (game_name, discount_rate, is_active, min_accuracy)
VALUES ('ink_mix_master', 10, true, NULL)
ON CONFLICT (game_name) DO UPDATE SET
  discount_rate = COALESCE(game_settings.discount_rate, EXCLUDED.discount_rate),
  is_active = COALESCE(game_settings.is_active, EXCLUDED.is_active);
