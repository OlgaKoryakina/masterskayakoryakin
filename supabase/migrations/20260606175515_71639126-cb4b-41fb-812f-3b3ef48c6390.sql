-- Remove duplicate public.has_role to prevent direct RPC access; private.has_role remains for policy use
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Tighten custom-references upload policy: require UUID-prefixed filename and limit to anon/authenticated
DROP POLICY IF EXISTS custom_refs_anyone_insert ON storage.objects;

CREATE POLICY custom_refs_anyone_insert
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'custom-references'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-'
  AND length(name) < 300
);