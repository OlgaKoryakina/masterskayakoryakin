
-- 1. Restrict profiles SELECT
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2. Validate request_items inserts: request must exist and be recent
DROP POLICY IF EXISTS "request_items_insert_anyone" ON public.request_items;
CREATE POLICY "request_items_insert_recent_request" ON public.request_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_items.request_id
        AND r.created_at > now() - interval '10 minutes'
    )
  );

-- 3. Replace WITH CHECK (true) on requests / custom_requests with basic validation
DROP POLICY IF EXISTS "requests_insert_anyone" ON public.requests;
CREATE POLICY "requests_insert_validated" ON public.requests
  FOR INSERT WITH CHECK (
    char_length(name) BETWEEN 2 AND 100
    AND char_length(phone) BETWEEN 5 AND 40
    AND (messenger IS NULL OR char_length(messenger) <= 100)
    AND (message IS NULL OR char_length(message) <= 2000)
    AND (custom_notes IS NULL OR char_length(custom_notes) <= 2000)
  );

DROP POLICY IF EXISTS "custom_requests_insert_anyone" ON public.custom_requests;
CREATE POLICY "custom_requests_insert_validated" ON public.custom_requests
  FOR INSERT WITH CHECK (
    char_length(name) BETWEEN 2 AND 100
    AND char_length(phone) BETWEEN 5 AND 40
    AND (messenger IS NULL OR char_length(messenger) <= 100)
    AND (message IS NULL OR char_length(message) <= 2000)
    AND array_length(reference_urls, 1) IS NULL OR array_length(reference_urls, 1) <= 10
  );

-- 4. Remove public listing of product-images bucket; admins can still list, public still reads via getPublicUrl (CDN)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_admin_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin')
  );

-- 5. Revoke direct EXECUTE on has_role from client roles (still usable from RLS / SECURITY DEFINER contexts)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
