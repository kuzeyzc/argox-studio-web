-- studio-assets bucket: sanatçı banner videoları ve diğer stüdyo medyaları.
-- Supabase Dashboard > SQL Editor'da çalıştırın (veya Storage > New bucket ile "studio-assets" oluşturup public yapın).

-- Bucket oluştur (public = URL ile doğrudan erişim)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-assets',
  'studio-assets',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Herkese okuma (public bucket)
CREATE POLICY "studio-assets public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'studio-assets');

-- Yükleme: anon ve authenticated (admin panel client anon key kullanıyor olabilir)
CREATE POLICY "studio-assets upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'studio-assets');

-- Güncelleme (upsert için)
CREATE POLICY "studio-assets update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'studio-assets');
