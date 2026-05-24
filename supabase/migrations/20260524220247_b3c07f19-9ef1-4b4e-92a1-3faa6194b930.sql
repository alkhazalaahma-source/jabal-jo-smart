
-- Service providers
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  specialty TEXT NOT NULL,
  specialty_ar TEXT,
  bio TEXT,
  bio_ar TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  rating NUMERIC DEFAULT 4.7,
  rating_count INTEGER DEFAULT 0,
  experience_years INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  hourly_rate NUMERIC,
  service_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read providers" ON public.service_providers
  FOR SELECT USING (true);

CREATE POLICY "Admin manage providers" ON public.service_providers
  FOR ALL USING (has_role(auth.uid(),'admin'));

-- Seed initial providers
INSERT INTO public.service_providers (name, name_ar, specialty, specialty_ar, bio_ar, city, phone, rating, experience_years, featured, service_slug, hourly_rate) VALUES
('Eng. Khaled Haddad','م. خالد حداد','Architectural Design','تصميم معماري','مهندس معماري بخبرة 12 سنة في تصاميم الفلل والمكاتب','عمّان','+962790000001',4.9,12,true,'architectural-design',25),
('Eng. Sami Odeh','م. سامي عودة','General Contracting','مقاولات عامة','منفذ مشاريع سكنية وتجارية بنظام تسليم مفتاح','عمّان','+962790000002',4.8,15,true,'general-contracting',NULL),
('Mohammad Awad','محمد عوض','Electrical Works','أعمال كهربائية','فني كهرباء معتمد - تأسيس وصيانة','الزرقاء','+962790000003',4.7,9,false,'electrical-works',8),
('Ahmad Salem','أحمد سالم','Plumbing','أعمال صحية','تأسيس وصيانة شبكات صرف ومياه','إربد','+962790000004',4.6,11,false,'plumbing',7),
('Layla Studio','استوديو ليلى','Decoration','ديكور','تصاميم داخلية وديكور فاخر','عمّان','+962790000005',4.9,8,true,'decoration',NULL),
('Tareq Painters','طارق للدهانات','Interior Finishing','تشطيبات داخلية','دهان وجبس وأرضيات','عمّان','+962790000006',4.7,10,false,'interior-finishing',NULL),
('Yousef Maintenance','يوسف للصيانة','Maintenance','صيانة شاملة','صيانة دورية وطارئة للمباني','عمّان','+962790000007',4.6,7,false,'maintenance',12),
('Nablus Trucks','شاحنات نابلس','Material Delivery','نقل وتوصيل مواد','أسطول شاحنات لنقل مواد البناء','الزرقاء','+962790000008',4.5,6,false,'material-delivery',NULL);

-- Initial order tracking row trigger
CREATE OR REPLACE FUNCTION public.create_initial_order_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.order_tracking (order_id, status, note)
  VALUES (NEW.id, NEW.status::text, 'Order created');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_initial_order_tracking ON public.orders;
CREATE TRIGGER trg_initial_order_tracking
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.create_initial_order_tracking();
