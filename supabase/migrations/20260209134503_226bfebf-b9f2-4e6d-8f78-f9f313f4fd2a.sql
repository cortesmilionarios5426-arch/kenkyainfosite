
-- Add business_type column to distinguish form types
ALTER TABLE public.form_responses ADD COLUMN business_type text NOT NULL DEFAULT 'professional';

-- Add accounting-specific columns
ALTER TABLE public.form_responses ADD COLUMN acct_main_service text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_service_area text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_monthly_clients text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_ideal_client text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_avg_ticket text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_client_volume_preference text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_who_answers text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_has_script text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_main_objection text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_closing_time text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_years_in_market text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_companies_served text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_niches_served text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_certifications text NULL;
ALTER TABLE public.form_responses ADD COLUMN acct_differentials text NULL;
