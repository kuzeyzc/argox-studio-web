-- Sanatçıların Ürün ve Piercing tablolarına erişimi
-- Mevcut "Allow all" policy'si zaten INSERT/UPDATE/DELETE'e izin veriyor.
-- İleride anon erişimini kısıtlasanız bile, giriş yapmış kullanıcılar (sanatçı + yönetici)
-- bu policy ile yazmaya devam eder.

-- Products: Authenticated kullanıcılar (admin panelde giriş yapan sanatçı/yönetici) tüm işlemleri yapabilsin
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Authenticated users can manage products" ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Piercings: Aynı şekilde authenticated kullanıcılar piercing ekleyebilsin, güncelleyebilsin, silebilsin
DROP POLICY IF EXISTS "Authenticated users can manage piercings" ON public.piercings;
CREATE POLICY "Authenticated users can manage piercings" ON public.piercings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
