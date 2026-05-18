
-- New categories for expanded catalog
INSERT INTO public.categories (slug, name_ar, name_en, icon, sort_order) VALUES
  ('steel', 'الحديد والصلب', 'Steel & Rebar', '🔩', 6),
  ('blocks', 'البلوك والطوب', 'Blocks & Bricks', '🧱', 7),
  ('aggregates', 'الرمل والبحص', 'Sand & Aggregates', '⛱️', 8),
  ('insulation', 'العزل والحماية', 'Insulation', '🛡️', 9),
  ('paint', 'الدهانات', 'Paints', '🎨', 10),
  ('wood', 'الأخشاب', 'Wood & Timber', '🪵', 11),
  ('tiles', 'البلاط والسيراميك', 'Tiles & Ceramics', '◼️', 12)
ON CONFLICT (slug) DO NOTHING;

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  price_monthly numeric NOT NULL,
  price_yearly numeric NOT NULL,
  features_ar jsonb NOT NULL DEFAULT '[]',
  features_en jsonb NOT NULL DEFAULT '[]',
  sort_order int DEFAULT 0,
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admin manage plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sub own view" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sub own create" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage subs" ON public.user_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Inspection / site visit requests
CREATE TABLE IF NOT EXISTS public.inspection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  inspection_type text NOT NULL,
  project_type text,
  area_m2 numeric,
  preferred_date date,
  notes text,
  status text DEFAULT 'pending',
  ticket_number text DEFAULT ('INS-' || to_char(now(), 'YYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.inspection_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insp own view" ON public.inspection_requests FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Insp public insert" ON public.inspection_requests FOR INSERT WITH CHECK (
  char_length(full_name) BETWEEN 2 AND 100
  AND char_length(phone) BETWEEN 6 AND 20
  AND char_length(city) BETWEEN 2 AND 100
  AND char_length(address) BETWEEN 2 AND 300
  AND char_length(inspection_type) BETWEEN 2 AND 50
);

-- Price quote requests
CREATE TABLE IF NOT EXISTS public.price_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  project_type text NOT NULL,
  area_m2 numeric NOT NULL,
  floors int DEFAULT 1,
  finish_level text DEFAULT 'standard',
  estimated_total numeric,
  breakdown jsonb,
  notes text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.price_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes own view" ON public.price_quotes FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Quotes public insert" ON public.price_quotes FOR INSERT WITH CHECK (
  char_length(full_name) BETWEEN 2 AND 100
  AND char_length(phone) BETWEEN 6 AND 20
  AND area_m2 > 0 AND area_m2 < 100000
);

-- Seed subscription plans
INSERT INTO public.subscription_plans (slug, name_ar, name_en, price_monthly, price_yearly, features_ar, features_en, sort_order, popular) VALUES
  ('basic', 'الأساسية', 'Basic', 0, 0,
    '["تصفح السوق", "تقدير أسعار محدود", "دعم بالبريد"]',
    '["Browse marketplace", "Limited price estimates", "Email support"]', 1, false),
  ('pro', 'المحترف', 'Pro', 19.9, 199,
    '["خصم 5% على كل الطلبات", "معاينة موقع مجانية شهرياً", "تقديرات غير محدودة", "دعم واتساب 24/7", "أولوية في الشحن"]',
    '["5% off all orders", "1 free site inspection/month", "Unlimited estimates", "24/7 WhatsApp support", "Priority shipping"]', 2, true),
  ('contractor', 'المقاول', 'Contractor', 49.9, 499,
    '["خصم 12% على كل الطلبات", "3 معاينات مجانية شهرياً", "مدير حساب مخصص", "شروط دفع آجلة", "عروض حصرية من الموردين", "API للتكامل"]',
    '["12% off all orders", "3 free inspections/month", "Dedicated account manager", "Deferred payment terms", "Exclusive supplier deals", "API access"]', 3, false);
