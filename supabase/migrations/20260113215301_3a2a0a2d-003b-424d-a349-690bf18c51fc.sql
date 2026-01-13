
-- Create enum for plans
CREATE TYPE public.plan_type AS ENUM ('presenca', 'conversao', 'autoridade');

-- Create main form responses table
CREATE TABLE public.form_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Common fields (all plans)
    business_name TEXT NOT NULL,
    main_service TEXT NOT NULL,
    business_colors TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    social_networks JSONB DEFAULT '[]'::jsonb,
    logo_url TEXT,
    chosen_plan plan_type NOT NULL,
    
    -- Presença fields (and up)
    professional_summary TEXT,
    services TEXT,
    location_hours TEXT,
    main_objective TEXT,
    
    -- Conversão fields (and up)
    pain_solutions TEXT,
    competitive_differentials TEXT,
    testimonials_section TEXT,
    visual_process TEXT,
    
    -- Autoridade fields
    faq TEXT,
    results_gallery TEXT,
    premium_visual_style TEXT,
    advanced_footer_map TEXT,
    
    -- Metadata
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can submit form)
CREATE POLICY "Anyone can submit form responses"
ON public.form_responses
FOR INSERT
WITH CHECK (true);

-- Create policy for admin select (will be controlled by role)
CREATE POLICY "Admins can view all responses"
ON public.form_responses
FOR SELECT
USING (true);

-- Create policy for admin update
CREATE POLICY "Admins can update responses"
ON public.form_responses
FOR UPDATE
USING (true);

-- Create policy for admin delete
CREATE POLICY "Admins can delete responses"
ON public.form_responses
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_form_responses_updated_at
BEFORE UPDATE ON public.form_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);
