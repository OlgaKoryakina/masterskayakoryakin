
CREATE TYPE public.testimonial_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  city text,
  text text NOT NULL,
  status public.testimonial_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.testimonials TO anon;
GRANT SELECT, INSERT ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (with length validation)
CREATE POLICY testimonials_insert_validated ON public.testimonials
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(author_name) BETWEEN 2 AND 100
  AND char_length(text) BETWEEN 10 AND 2000
  AND (city IS NULL OR char_length(city) <= 100)
  AND status = 'pending'
);

-- Anyone can read approved
CREATE POLICY testimonials_select_approved ON public.testimonials
FOR SELECT TO anon, authenticated
USING (status = 'approved');

-- Admins full access
CREATE POLICY testimonials_admin_all ON public.testimonials
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER testimonials_set_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
