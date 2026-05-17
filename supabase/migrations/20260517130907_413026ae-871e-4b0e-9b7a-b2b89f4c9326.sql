
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- Tighten contact form: require basic length validation
DROP POLICY IF EXISTS "Contact public insert" ON public.contact_messages;
CREATE POLICY "Contact public insert" ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(full_name) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 5 AND 255
    AND char_length(subject) BETWEEN 2 AND 200
    AND char_length(message) BETWEEN 5 AND 2000
  );
