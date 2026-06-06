DROP POLICY IF EXISTS custom_requests_insert_validated ON public.custom_requests;

CREATE POLICY custom_requests_insert_validated
ON public.custom_requests
FOR INSERT
TO public
WITH CHECK (
  char_length(name) BETWEEN 2 AND 100
  AND char_length(phone) BETWEEN 2 AND 100
  AND (messenger IS NULL OR char_length(messenger) <= 100)
  AND (message IS NULL OR char_length(message) <= 2000)
  AND (array_length(reference_urls, 1) IS NULL OR array_length(reference_urls, 1) <= 10)
);