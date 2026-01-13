
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Admins can view all responses" ON public.form_responses;
DROP POLICY IF EXISTS "Admins can update responses" ON public.form_responses;
DROP POLICY IF EXISTS "Admins can delete responses" ON public.form_responses;

-- Create secure policies using the has_role function
CREATE POLICY "Admins can view all responses"
ON public.form_responses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update responses"
ON public.form_responses
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete responses"
ON public.form_responses
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
