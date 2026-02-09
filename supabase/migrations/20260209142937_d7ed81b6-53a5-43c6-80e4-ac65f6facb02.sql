
-- Add domain option suggestions (both flows)
ALTER TABLE public.form_responses ADD COLUMN domain_option_1 text;
ALTER TABLE public.form_responses ADD COLUMN domain_option_2 text;

-- Add accounting hosting mode: 'full_config' (we handle everything) or 'tech_responsible' (they appoint us as responsible)
ALTER TABLE public.form_responses ADD COLUMN acct_hosting_mode text;
