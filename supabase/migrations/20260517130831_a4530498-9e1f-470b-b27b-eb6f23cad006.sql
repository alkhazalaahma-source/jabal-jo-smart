
-- Roles enum + table (separate for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'supplier', 'driver', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  language TEXT DEFAULT 'ar',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles view own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Companies / brands
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  logo_url TEXT,
  description TEXT,
  city TEXT,
  verified BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 4.5,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admin manage companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category_id UUID REFERENCES public.categories(id),
  company_id UUID REFERENCES public.companies(id),
  price NUMERIC(10,2) NOT NULL,
  unit_ar TEXT DEFAULT 'قطعة',
  unit_en TEXT DEFAULT 'piece',
  stock_quantity INT DEFAULT 100,
  in_stock BOOLEAN DEFAULT true,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(2,1) DEFAULT 4.5,
  rating_count INT DEFAULT 0,
  order_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart own" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash','cliq','card','bank_transfer');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'JBL-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,6),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 5,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders own view" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders own create" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items own view" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "Order items insert via order" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews own write" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews own update" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Reviews own delete" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- AI chat
CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat own view" ON public.ai_chat_messages FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Chat own insert" ON public.ai_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Contact / complaints
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE DEFAULT 'TKT-' || to_char(now(),'YYMMDD') || '-' || substr(gen_random_uuid()::text,1,6),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'contact' CHECK (type IN ('contact','complaint')),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact public insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact own view" ON public.contact_messages FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- Seed categories
INSERT INTO public.categories (slug, name_ar, name_en, icon, sort_order) VALUES
('cement', 'مواد البناء الأساسية', 'Basic Materials', 'Package', 1),
('chemicals', 'المواد الكيميائية', 'Chemicals & Sealants', 'FlaskConical', 2),
('finishing', 'التشطيبات والديكور', 'Finishing & Decor', 'Paintbrush', 3),
('electrical', 'الكهرباء والسباكة', 'Electrical & Plumbing', 'Zap', 4),
('tools', 'العدد والمثبتات', 'Tools & Fasteners', 'Wrench', 5);

-- Seed companies (real Jordan brands)
INSERT INTO public.companies (name, name_ar, description, city, verified, rating) VALUES
('Lafarge Jordan', 'لافارج الأردن', 'Leading cement producer in Jordan', 'Amman', true, 4.8),
('Manaseer Group', 'مجموعة المناصير', 'Cement, steel, and industrial materials', 'Amman', true, 4.7),
('Al Rajhi Cement', 'إسمنت الراجحي', 'High quality cement', 'Zarqa', true, 4.6),
('Jordan Steel', 'حديد الأردن', 'Reinforcement steel manufacturer', 'Amman', true, 4.7),
('حديد الاتحاد', 'حديد الاتحاد', 'Steel rebar and structural', 'Amman', true, 4.5),
('Sika Jordan', 'سيكا الأردن', 'Concrete admixtures and sealants', 'Amman', true, 4.8),
('Weber', 'ويبر', 'Tile adhesives and grouts', 'Amman', true, 4.7),
('Mapei', 'مابي', 'Construction chemicals', 'Amman', true, 4.7);

-- Seed products
INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'إسمنت بورتلاندي عادي', 'Ordinary Portland Cement', 'إسمنت عالي الجودة مطابق للمواصفات الأردنية، مناسب لجميع أعمال البناء', 'High quality Portland cement, suitable for all construction', c.id, co.id, 4.50, 'كيس 50كغ', '50kg bag', 5000, 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800', true, 4.8, 245, 1820
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='Lafarge Jordan';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'إسمنت مقاوم للكبريتات', 'Sulphate Resistant Cement', 'إسمنت مقاوم للكبريتات للأساسات والبيئات العدوانية', 'Sulphate resistant for foundations', c.id, co.id, 5.20, 'كيس 50كغ', '50kg bag', 2500, 'https://images.unsplash.com/photo-1590725140246-20acdee442be?w=800', false, 4.6, 88, 410
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='Manaseer Group';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'حديد تسليح 12مم', 'Rebar Steel 12mm', 'حديد تسليح عالي الشد قطر 12مم، طول 12 متر', 'High tensile rebar 12mm, 12m length', c.id, co.id, 520.00, 'طن', 'ton', 800, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800', true, 4.7, 156, 920
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='Jordan Steel';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'حديد تسليح 16مم', 'Rebar Steel 16mm', 'حديد تسليح عالي الشد قطر 16مم', 'High tensile rebar 16mm', c.id, co.id, 525.00, 'طن', 'ton', 600, 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=800', false, 4.7, 92, 540
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='حديد الاتحاد';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'بلوك إسمنتي 20سم', 'Concrete Block 20cm', 'بلوك إسمنتي مقاس 20×20×40 سم للجدران الحاملة', 'Load-bearing concrete block 20×20×40cm', c.id, co.id, 0.45, 'قطعة', 'piece', 50000, 'https://images.unsplash.com/photo-1604709177595-ee9c2580e9a8?w=800', true, 4.5, 320, 8200
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='Manaseer Group';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'رمل ناعم مغسول', 'Fine Washed Sand', 'رمل ناعم مغسول للبياض والقصارة', 'Fine washed sand for plastering', c.id, co.id, 12.00, 'متر مكعب', 'cubic meter', 3000, 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800', false, 4.4, 67, 410
FROM public.categories c, public.companies co WHERE c.slug='cement' AND co.name='Manaseer Group';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'مادة عزل مائي سيكا', 'Sika Waterproofing', 'مادة عزل مائي عالية الجودة للأسطح والحمامات', 'Premium waterproofing for roofs and bathrooms', c.id, co.id, 28.00, 'جالون 20كغ', '20kg gallon', 600, 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800', true, 4.9, 198, 750
FROM public.categories c, public.companies co WHERE c.slug='chemicals' AND co.name='Sika Jordan';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'لاصق بلاط ويبر', 'Weber Tile Adhesive', 'لاصق سيراميك وبورسلان عالي الالتصاق', 'High-bond ceramic and porcelain adhesive', c.id, co.id, 9.50, 'كيس 25كغ', '25kg bag', 1500, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', false, 4.7, 134, 620
FROM public.categories c, public.companies co WHERE c.slug='chemicals' AND co.name='Weber';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'جراوت مابي للبلاط', 'Mapei Tile Grout', 'جراوت ملون لتعبئة فواصل البلاط', 'Colored grout for tile joints', c.id, co.id, 6.50, 'كيس 5كغ', '5kg bag', 2200, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', false, 4.6, 89, 380
FROM public.categories c, public.companies co WHERE c.slug='chemicals' AND co.name='Mapei';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'دهان داخلي أبيض', 'Interior White Paint', 'دهان داخلي أبيض قابل للغسيل', 'Washable interior white paint', c.id, co.id, 32.00, 'جالون 15لتر', '15L gallon', 800, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800', true, 4.5, 210, 980
FROM public.categories c, public.companies co WHERE c.slug='finishing' AND co.name='Sika Jordan';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'بلاط بورسلان 60×60', 'Porcelain Tile 60×60', 'بلاط بورسلان رمادي 60×60 سم', 'Grey porcelain tile 60×60cm', c.id, co.id, 14.00, 'متر مربع', 'sqm', 4500, 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800', true, 4.6, 178, 1240
FROM public.categories c, public.companies co WHERE c.slug='finishing' AND co.name='Weber';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'جبس بورد 12مم', 'Gypsum Board 12mm', 'لوح جبس بورد 12مم 120×240سم', 'Gypsum board 12mm 120×240cm', c.id, co.id, 8.50, 'لوح', 'sheet', 2000, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', false, 4.5, 76, 410
FROM public.categories c, public.companies co WHERE c.slug='finishing' AND co.name='Mapei';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'كابل كهرباء 2.5مم', 'Electrical Cable 2.5mm', 'كابل نحاس مزدوج العزل 2.5مم', 'Double insulated copper cable 2.5mm', c.id, co.id, 1.20, 'متر', 'meter', 10000, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', false, 4.4, 145, 2100
FROM public.categories c, public.companies co WHERE c.slug='electrical' AND co.name='Manaseer Group';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'مواسير PPR 25مم', 'PPR Pipe 25mm', 'مواسير PPR للمياه الساخنة والباردة', 'PPR pipes for hot and cold water', c.id, co.id, 3.80, 'متر', 'meter', 4500, 'https://images.unsplash.com/photo-1635424710928-0544e8f6c52d?w=800', false, 4.6, 92, 780
FROM public.categories c, public.companies co WHERE c.slug='electrical' AND co.name='Lafarge Jordan';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'صندوق مسامير حديد', 'Steel Nails Box', 'صندوق مسامير حديد متنوعة الأحجام', 'Mixed sizes steel nails box', c.id, co.id, 6.00, 'صندوق 1كغ', '1kg box', 1800, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800', false, 4.3, 54, 320
FROM public.categories c, public.companies co WHERE c.slug='tools' AND co.name='Jordan Steel';

INSERT INTO public.products (name_ar, name_en, description_ar, description_en, category_id, company_id, price, unit_ar, unit_en, stock_quantity, image_url, featured, rating, rating_count, order_count)
SELECT 'مفك كهربائي احترافي', 'Professional Electric Drill', 'مفك كهربائي 18V مع بطاريتين', 'Cordless drill 18V with 2 batteries', c.id, co.id, 95.00, 'قطعة', 'piece', 250, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', true, 4.8, 122, 480
FROM public.categories c, public.companies co WHERE c.slug='tools' AND co.name='Sika Jordan';
