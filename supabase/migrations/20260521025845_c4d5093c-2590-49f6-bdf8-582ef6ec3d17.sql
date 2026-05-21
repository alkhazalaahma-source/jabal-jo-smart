
-- Contractors directory
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  name_ar TEXT,
  logo_url TEXT,
  bio TEXT,
  bio_ar TEXT,
  specialties TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 0,
  completed_projects INT DEFAULT 0,
  rating NUMERIC DEFAULT 4.5,
  rating_count INT DEFAULT 0,
  portfolio JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  email TEXT,
  verified BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read contractors" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "Admin manage contractors" ON public.contractors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Contractor update own" ON public.contractors FOR UPDATE USING (auth.uid() = user_id);

-- Turnkey project requests
CREATE TABLE public.turnkey_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT NOT NULL DEFAULT ('PRJ-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  project_type TEXT NOT NULL,
  area_m2 NUMERIC NOT NULL,
  floors INT DEFAULT 1,
  city TEXT NOT NULL,
  address TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  description TEXT,
  plans_urls JSONB DEFAULT '[]'::jsonb,
  finish_level TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_contractor_id UUID,
  accepted_bid_id UUID,
  progress_percent INT DEFAULT 0,
  start_date DATE,
  expected_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.turnkey_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner view project" ON public.turnkey_projects FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid()));
CREATE POLICY "Owner create project" ON public.turnkey_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id AND char_length(full_name) >= 2 AND area_m2 > 0 AND area_m2 < 100000);
CREATE POLICY "Owner update project" ON public.turnkey_projects FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid() AND c.id = assigned_contractor_id));

-- Contractor bids on projects
CREATE TABLE public.contractor_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.turnkey_projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  duration_days INT NOT NULL,
  details TEXT,
  materials TEXT,
  warranty_months INT DEFAULT 12,
  payment_schedule JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contractor_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bid view by project owner or bidder" ON public.contractor_bids FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Contractor submit bid" ON public.contractor_bids FOR INSERT
  WITH CHECK (auth.uid() = user_id AND price > 0 AND duration_days > 0);
CREATE POLICY "Bid update own" ON public.contractor_bids FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

-- Project progress updates
CREATE TABLE public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.turnkey_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  progress_percent INT,
  stage TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Updates view stakeholders" ON public.project_updates FOR SELECT
  USING (has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id
      AND (p.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid() AND c.id = p.assigned_contractor_id))));
CREATE POLICY "Updates insert by contractor or owner" ON public.project_updates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payment schedule
CREATE TABLE public.project_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.turnkey_projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments view stakeholders" ON public.project_payments FOR SELECT
  USING (has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id
      AND (p.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid() AND c.id = p.assigned_contractor_id))));
CREATE POLICY "Payments insert stakeholders" ON public.project_payments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid() AND c.id = p.assigned_contractor_id))));
CREATE POLICY "Payments update stakeholders" ON public.project_payments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.turnkey_projects p WHERE p.id = project_id
    AND (p.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.contractors c WHERE c.user_id = auth.uid() AND c.id = p.assigned_contractor_id))));

-- Seed contractors
INSERT INTO public.contractors (name, name_ar, bio, bio_ar, specialties, regions, experience_years, completed_projects, rating, rating_count, logo_url, portfolio, phone, featured) VALUES
('Al-Bina Contracting', 'البناء للمقاولات', 'Leading turnkey contractor in Amman with 20+ years experience.', 'شركة رائدة في المقاولات وتسليم المفتاح بخبرة تزيد عن 20 سنة.', ARRAY['residential','villas','commercial'], ARRAY['Amman','Zarqa'], 22, 156, 4.9, 89, 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200', '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]'::jsonb, '+962790000001', true),
('Jordan Build Co.', 'الأردن للإنشاءات', 'Specialized in villas and luxury finishing across Jordan.', 'متخصصون في تنفيذ الفلل والتشطيبات الفاخرة في الأردن.', ARRAY['villas','finishing','renovation'], ARRAY['Amman','Irbid','Aqaba'], 15, 98, 4.8, 64, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200', '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::jsonb, '+962790000002', true),
('Petra Engineering', 'البتراء الهندسية', 'Commercial and industrial construction specialists.', 'خبراء في المشاريع التجارية والصناعية.', ARRAY['commercial','industrial'], ARRAY['Amman','Madaba'], 18, 72, 4.7, 41, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200', '["https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=800"]'::jsonb, '+962790000003', false),
('North Star Contractors', 'نجم الشمال', 'Affordable quality residential projects in northern Jordan.', 'مشاريع سكنية بجودة عالية وأسعار مناسبة في شمال الأردن.', ARRAY['residential','renovation'], ARRAY['Irbid','Jerash','Ajloun'], 10, 54, 4.6, 38, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200', '["https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800"]'::jsonb, '+962790000004', false),
('Royal Finishing', 'التشطيبات الملكية', 'Premium interior finishing and design.', 'تشطيبات داخلية فاخرة وتصميم.', ARRAY['finishing','interior','design'], ARRAY['Amman'], 12, 110, 4.9, 76, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200', '["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"]'::jsonb, '+962790000005', true);
