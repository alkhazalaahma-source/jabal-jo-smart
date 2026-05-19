
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order numeric NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active codes" ON public.discount_codes
  FOR SELECT USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admin manage codes" ON public.discount_codes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.inspection_requests ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.inspection_requests ADD COLUMN IF NOT EXISTS email text;

INSERT INTO public.discount_codes (code, discount_type, discount_value, min_order) VALUES
  ('WELCOME10', 'percent', 10, 0),
  ('JABAL5', 'fixed', 5, 30),
  ('BUILD20', 'percent', 20, 100);
