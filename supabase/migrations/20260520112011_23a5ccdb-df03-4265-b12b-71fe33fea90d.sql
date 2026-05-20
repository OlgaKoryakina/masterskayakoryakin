
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.product_category AS ENUM ('belt', 'buckle');
CREATE TYPE public.product_status AS ENUM ('in_stock', 'made_to_order');
CREATE TYPE public.request_status AS ENUM ('new', 'in_progress', 'closed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category product_category NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  character_tags TEXT[] NOT NULL DEFAULT '{}',
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  status product_status NOT NULL DEFAULT 'made_to_order',
  price NUMERIC(10,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  messenger TEXT,
  message TEXT,
  custom_notes TEXT,
  status request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  note TEXT
);
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;

-- Custom requests
CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  messenger TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  message TEXT,
  reference_urls TEXT[] NOT NULL DEFAULT '{}',
  status request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Site content KV
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAQ
CREATE TABLE public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- products
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- requests
CREATE POLICY "requests_insert_anyone" ON public.requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_admin_select" ON public.requests FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests_admin_update" ON public.requests FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests_admin_delete" ON public.requests FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- request_items
CREATE POLICY "request_items_insert_anyone" ON public.request_items FOR INSERT WITH CHECK (true);
CREATE POLICY "request_items_admin_select" ON public.request_items FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "request_items_admin_delete" ON public.request_items FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- custom_requests
CREATE POLICY "custom_requests_insert_anyone" ON public.custom_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "custom_requests_admin_all" ON public.custom_requests FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- site_content
CREATE POLICY "site_content_select_all" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content_admin_write" ON public.site_content FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- faq
CREATE POLICY "faq_select_all" ON public.faq_items FOR SELECT USING (true);
CREATE POLICY "faq_admin_write" ON public.faq_items FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('custom-references', 'custom-references', false);

CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "custom_refs_anyone_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'custom-references');
CREATE POLICY "custom_refs_admin_select" ON storage.objects FOR SELECT USING (bucket_id = 'custom-references' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "custom_refs_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'custom-references' AND public.has_role(auth.uid(),'admin'));

-- Seed site_content & FAQ
INSERT INTO public.site_content (key, value) VALUES
  ('hero', '{"title":"Изделия, которые стареют красиво","subtitle":"Ремни и латунные пряжки ручной работы. Ограниченные серии. Авторское тиснение.","cta":"Смотреть коллекцию"}'),
  ('philosophy', '{"text":"Мы работаем с кожей растительного дубления и латунью собственной отливки. Каждое изделие проходит через руки мастера от эскиза до полировки. Без конвейера. Без компромиссов."}'),
  ('shipping', '{"text":"Срок изготовления — от 5 до 21 дня в зависимости от сложности. Отправляем СДЭК и Почтой России по всей России и миру. Каждое изделие упаковано в фирменный льняной мешок и крафтовую коробку."}'),
  ('contacts', '{"phone":"+7 (999) 000-00-00","telegram":"@koryakin_workshop","email":"hello@koryakin.studio","city":"Россия, Москва"}');

INSERT INTO public.faq_items (question, answer, sort_order) VALUES
  ('Как подобрать размер ремня?','Измерьте обхват по любимому ремню от основания пряжки до часто используемого отверстия. Эту величину укажите в комментарии — мы изготовим ремень точно под вас.',1),
  ('Можно ли сделать свой рисунок тиснения?','Да. Пришлите эскиз, монограмму или идею в свободной форме — мастер согласует с вами финальный рисунок перед началом работы.',2),
  ('Как ухаживать за кожей?','Раз в 2–3 месяца протирайте мягкой тканью и наносите небольшое количество кожаного бальзама. Избегайте долгого контакта с водой и прямыми солнечными лучами.',3),
  ('Сколько занимает изготовление?','От 5 дней для изделий из наличия до 3 недель для индивидуальных заказов с авторской пряжкой.',4),
  ('Все ли изделия уникальны?','Да. Мы не делаем тиражей — каждый ремень и каждая пряжка существуют в единственном экземпляре или малой серии до 5 штук.',5);
