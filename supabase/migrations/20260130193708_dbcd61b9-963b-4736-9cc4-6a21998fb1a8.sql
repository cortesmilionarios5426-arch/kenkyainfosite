-- Add missing columns for hosting, domain registration and conversion gallery
ALTER TABLE public.form_responses 
ADD COLUMN IF NOT EXISTS hosting_option text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS domain_registration jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conversion_gallery text DEFAULT NULL;