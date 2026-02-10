-- Randevu tablosu: artist_id null ise "Tercihim Yok" (genel randevu)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  artist_id text REFERENCES public.artists(id) ON DELETE SET NULL,
  tattoo_description text NOT NULL DEFAULT '',
  appointment_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_artist_id ON public.appointments (artist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments (appointment_date);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for appointments" ON public.appointments;
CREATE POLICY "Allow all for appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
