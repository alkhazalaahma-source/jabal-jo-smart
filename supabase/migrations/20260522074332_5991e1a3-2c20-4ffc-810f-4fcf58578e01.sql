
-- Suppliers / Factories
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  type text NOT NULL DEFAULT 'supplier', -- supplier | factory
  category text,
  city text,
  phone text,
  email text,
  logo_url text,
  description text,
  description_ar text,
  rating numeric DEFAULT 4.5,
  verified boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Admin manage suppliers" ON public.suppliers FOR ALL USING (has_role(auth.uid(),'admin'));

-- RFQ
CREATE TABLE public.rfq_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL,
  material text NOT NULL,
  quantity numeric NOT NULL,
  unit text DEFAULT 'ton',
  delivery_date date,
  notes text,
  status text DEFAULT 'open',
  ticket_number text DEFAULT ('RFQ-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.rfq_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RFQ own view" ON public.rfq_requests FOR SELECT USING (auth.uid()=user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "RFQ public insert" ON public.rfq_requests FOR INSERT WITH CHECK (char_length(full_name)>=2 AND char_length(phone)>=6 AND quantity>0);

CREATE TABLE public.rfq_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfq_requests(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id),
  supplier_name text NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  delivery_days integer DEFAULT 3,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.rfq_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RFQ offers view by owner" ON public.rfq_offers FOR SELECT USING (
  has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.rfq_requests r WHERE r.id=rfq_offers.rfq_id AND r.user_id=auth.uid())
);
CREATE POLICY "RFQ offers admin manage" ON public.rfq_offers FOR ALL USING (has_role(auth.uid(),'admin'));

-- Order tracking
CREATE TABLE public.order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracking view by order owner" ON public.order_tracking FOR SELECT USING (
  has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_tracking.order_id AND o.user_id=auth.uid())
);
CREATE POLICY "Tracking admin manage" ON public.order_tracking FOR ALL USING (has_role(auth.uid(),'admin'));

-- Loyalty & referral
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  ADD COLUMN IF NOT EXISTS referred_by text;

-- Completed projects gallery
CREATE TABLE public.completed_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  description text,
  description_ar text,
  city text,
  category text,
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  area_m2 numeric,
  year integer,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.completed_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read completed" ON public.completed_projects FOR SELECT USING (true);
CREATE POLICY "Admin manage completed" ON public.completed_projects FOR ALL USING (has_role(auth.uid(),'admin'));

-- Seed suppliers
INSERT INTO public.suppliers (name, name_ar, type, category, city, phone, description_ar, featured) VALUES
('Lafarge Jordan','مصنع لافارج الأردن','factory','cement','عمان','+962640000','أكبر منتج للإسمنت في الأردن',true),
('Jordan Steel','حديد الأردن','factory','steel','الزرقاء','+962530000','مصنع حديد التسليح بمختلف المقاسات',true),
('Manaseer Group','مجموعة المناصير','factory','cement','عمان','+962641111','إسمنت ومواد بناء متكاملة',true),
('Al-Rasheed Suppliers','موردو الرشيد','supplier','aggregate','إربد','+962271111','بحص ورمل وحصمة',false),
('JABAL Marble','جبل للرخام','factory','marble','عمان','+962651111','رخام وجرانيت طبيعي',false),
('National Tiles','البلاط الوطني','factory','tiles','الزرقاء','+962532222','بلاط سيراميك وبورسلان',false);

-- Seed completed projects
INSERT INTO public.completed_projects (title, title_ar, city, category, image_url, area_m2, year, featured, description_ar) VALUES
('Modern Villa - Abdoun','فيلا عصرية - عبدون','عمان','villa','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',420,2025,true,'فيلا فاخرة بتشطيب سوبر ديلوكس'),
('Family House - Irbid','منزل عائلي - إربد','إربد','residential','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',220,2024,true,'منزل سكني من طابقين'),
('Commercial Building - Amman','مبنى تجاري - عمان','عمان','commercial','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',1200,2024,true,'مبنى تجاري متعدد الطوابق'),
('Luxury Apartment Finish','تشطيب شقة فاخرة','عمان','finishing','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',180,2025,false,'تشطيب كامل بأعلى المواصفات');
