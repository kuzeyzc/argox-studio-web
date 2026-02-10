-- ArgoX Studio – Supabase şema
-- Supabase Dashboard > SQL Editor'da bu dosyayı çalıştırın.

-- ========== RLS (Row Level Security) ==========
-- İsterseniz auth sonrası sadece yetkili kullanıcılara kısıtlayabilirsiniz.
-- Şimdilik anon key ile okuma/yazma açık (admin panel client'tan çalışacak).

-- ========== ARTISTS ==========
CREATE TABLE IF NOT EXISTS public.artists (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  specialty text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  banner_video_url text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  socials jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- Slug URL'de kullanılır; isim değişince güncellenir. Benzersiz olmalı.
CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_key ON public.artists (slug) WHERE slug <> '';

-- ========== GALLERY (Tattoo Works) ==========
CREATE TABLE IF NOT EXISTS public.tattoo_works (
  id text PRIMARY KEY,
  image text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  artist_name text NOT NULL DEFAULT '',
  artist_id text NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'Dövme' CHECK (category IN ('Dövme', 'Piercing', 'Sanat')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== TESTIMONIALS ==========
CREATE TABLE IF NOT EXISTS public.testimonials (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  rating int NOT NULL DEFAULT 5,
  artist_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== SERVICES ==========
CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== PRODUCTS (Tasarım Ürünler: Kıyafet / Aksesuar) ==========
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Kıyafet' CHECK (category IN ('Kıyafet', 'Aksesuar')),
  stock_status text NOT NULL DEFAULT 'Var' CHECK (stock_status IN ('Var', 'Yok')),
  whatsapp_number text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== PIERCINGS (Piercing tanıtım ve görselleme) ==========
CREATE TABLE IF NOT EXISTS public.piercings (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  body_part text NOT NULL DEFAULT '',
  body_region text NOT NULL DEFAULT 'Kulak' CHECK (body_region IN ('Kulak', 'Burun', 'Dudak', 'Kaş', 'Dil', 'Göbek', 'Diğer')),
  material text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  product_image_url text NOT NULL DEFAULT '',
  model_image_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== VALUE_ITEMS (Değerlerimiz) ==========
CREATE TABLE IF NOT EXISTS public.value_items (
  id text PRIMARY KEY,
  icon text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========== HERO (tek satır) ==========
CREATE TABLE IF NOT EXISTS public.hero (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tagline text NOT NULL DEFAULT '',
  title_line_1 text NOT NULL DEFAULT '',
  title_line_2 text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  cta_gallery text NOT NULL DEFAULT '',
  cta_artists text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.hero (id, tagline, title_line_1, title_line_2, subtitle, cta_gallery, cta_artists)
VALUES (1, 'Premium Dövme Stüdyosu', 'Senin Hikâyeni', 'Mürekkeple Yazıyoruz',
  'Sanat ile derinin buluştuğu yer. İstanbul''un kalbinde dünya standartlarında sanatçılarla özel tasarımlar.',
  'GALERİYİ KEŞFET', 'SANATÇILAR')
ON CONFLICT (id) DO NOTHING;

-- ========== ABOUT (tek satır) ==========
CREATE TABLE IF NOT EXISTS public.about (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  section_label text NOT NULL DEFAULT '',
  section_title text NOT NULL DEFAULT '',
  paragraph_1 text NOT NULL DEFAULT '',
  paragraph_2 text NOT NULL DEFAULT '',
  location_label text NOT NULL DEFAULT '',
  location_value text NOT NULL DEFAULT '',
  hours_label text NOT NULL DEFAULT '',
  hours_value text NOT NULL DEFAULT '',
  certification_label text NOT NULL DEFAULT '',
  certification_value text NOT NULL DEFAULT '',
  stat_tattoos text NOT NULL DEFAULT '',
  stat_artists text NOT NULL DEFAULT '',
  stat_years text NOT NULL DEFAULT '',
  stat_awards text NOT NULL DEFAULT '',
  more_link_text text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.about (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ========== CONTACT (tek satır) ==========
CREATE TABLE IF NOT EXISTS public.contact (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  map_embed_url text NOT NULL DEFAULT '',
  working_hours jsonb NOT NULL DEFAULT '[]',
  studio_section_title text NOT NULL DEFAULT '',
  studio_section_subtitle text NOT NULL DEFAULT '',
  contact_title text NOT NULL DEFAULT '',
  phone_label text NOT NULL DEFAULT '',
  location_label text NOT NULL DEFAULT '',
  email_label text NOT NULL DEFAULT '',
  hours_label text NOT NULL DEFAULT '',
  studio_photos jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.contact (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ========== FOOTER (tek satır) ==========
CREATE TABLE IF NOT EXISTS public.footer (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  copyright text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.footer (id, copyright) VALUES (1, '© 2026 ArgoX Dövme Stüdyosu. Tüm hakları saklıdır.') ON CONFLICT (id) DO NOTHING;

-- ========== SECTION_LABELS (tek satır) ==========
CREATE TABLE IF NOT EXISTS public.section_labels (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  testimonials jsonb NOT NULL DEFAULT '{"sectionLabel":"","sectionTitle":""}',
  services jsonb NOT NULL DEFAULT '{"sectionLabel":"","sectionTitle":"","moreLinkText":""}',
  recently_inked jsonb NOT NULL DEFAULT '{"sectionLabel":"","sectionTitle":"","viewAllText":""}',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.section_labels (id, testimonials, services, recently_inked) VALUES (
  1,
  '{"sectionLabel":"Sesler","sectionTitle":"Müşterilerimiz Ne Diyor"}',
  '{"sectionLabel":"Neler Yapıyoruz","sectionTitle":"Hizmetlerimiz","moreLinkText":"Tümünü Keşfet"}',
  '{"sectionLabel":"Son Çalışmalar","sectionTitle":"Yeni Mürekkepler","viewAllText":"Tümünü Gör"}'
) ON CONFLICT (id) DO NOTHING;

-- ========== ADMIN PROFILES (Supabase Auth ile eşleşme) ==========
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('MANAGER', 'ARTIST')),
  artist_id text REFERENCES public.artists(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- İlk girişte manager profilini oluşturmak için RPC (e-posta manager@argox.studio ise MANAGER atanır)
CREATE OR REPLACE FUNCTION public.ensure_admin_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_artist_id text;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email = 'manager@argox.studio' THEN
    v_role := 'MANAGER';
    v_artist_id := NULL;
  ELSE
    SELECT id INTO v_artist_id FROM public.artists WHERE LOWER(TRIM(email)) = LOWER(TRIM(v_email)) LIMIT 1;
    IF v_artist_id IS NOT NULL THEN
      v_role := 'ARTIST';
    ELSE
      RETURN jsonb_build_object('ok', false, 'error', 'unknown_email');
    END IF;
  END IF;
  INSERT INTO public.admin_profiles (user_id, role, artist_id)
  VALUES (v_user_id, v_role, v_artist_id)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, artist_id = EXCLUDED.artist_id;
  RETURN jsonb_build_object('ok', true, 'role', v_role, 'artist_id', v_artist_id);
END;
$$;

-- Policy: Authenticated users can read their own profile
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can read own admin profile" ON public.admin_profiles
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own admin profile (ensure_admin_profile)" ON public.admin_profiles;
CREATE POLICY "Users can insert own admin profile (ensure_admin_profile)" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can update own admin profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Studio tabloları: anon/service ile okuma-yazma (admin panel client'tan kullanılacak)
-- İsterseniz RLS ekleyip sadece admin_profiles.role = 'MANAGER' veya ilgili artist için yazma kısıtı koyabilirsiniz.
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tattoo_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piercings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_labels ENABLE ROW LEVEL SECURITY;

-- Tüm studio tablolarına anon okuma/yazma (geliştirme için; production'da RLS kurallarını sıkılaştırın)
DROP POLICY IF EXISTS "Allow all for artists" ON public.artists;
CREATE POLICY "Allow all for artists" ON public.artists FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for tattoo_works" ON public.tattoo_works;
CREATE POLICY "Allow all for tattoo_works" ON public.tattoo_works FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for testimonials" ON public.testimonials;
CREATE POLICY "Allow all for testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for services" ON public.services;
CREATE POLICY "Allow all for services" ON public.services FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for value_items" ON public.value_items;
CREATE POLICY "Allow all for value_items" ON public.value_items FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for products" ON public.products;
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for piercings" ON public.piercings;
CREATE POLICY "Allow all for piercings" ON public.piercings FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for hero" ON public.hero;
CREATE POLICY "Allow all for hero" ON public.hero FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for about" ON public.about;
CREATE POLICY "Allow all for about" ON public.about FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for contact" ON public.contact;
CREATE POLICY "Allow all for contact" ON public.contact FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for footer" ON public.footer;
CREATE POLICY "Allow all for footer" ON public.footer FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for section_labels" ON public.section_labels;
CREATE POLICY "Allow all for section_labels" ON public.section_labels FOR ALL USING (true) WITH CHECK (true);
