
-- Create Candidate Profile table
CREATE TABLE IF NOT EXISTS public.candidate_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    image_url TEXT,
    phone TEXT,
    whatsapp TEXT,
    facebook TEXT,
    instagram TEXT,
    twitter TEXT,
    linkedin TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Candidate Achievements table
CREATE TABLE IF NOT EXISTS public.candidate_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    year TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.candidate_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to be safe if rerun)
DROP POLICY IF EXISTS "Public can view candidate profile" ON public.candidate_profile;
DROP POLICY IF EXISTS "Admins can manage candidate profile" ON public.candidate_profile;
DROP POLICY IF EXISTS "Public can view achievements" ON public.candidate_achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.candidate_achievements;

-- Policies for candidate_profile
CREATE POLICY "Public can view candidate profile" ON public.candidate_profile FOR SELECT USING (true);
CREATE POLICY "Admins can manage candidate profile" ON public.candidate_profile FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'candidate'));

-- Policies for candidate_achievements
CREATE POLICY "Public can view achievements" ON public.candidate_achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.candidate_achievements FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'candidate'));

-- Triggers for updated_at
CREATE TRIGGER update_candidate_profile_updated_at BEFORE UPDATE ON public.candidate_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_achievements_updated_at BEFORE UPDATE ON public.candidate_achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data if empty
INSERT INTO public.candidate_profile (full_name, title, bio)
SELECT 'ا. نبيل أبو وردة', 'نائب دائرة المنصورة', 'نبذة تعريفية عن النائب نبيل أبو وردة وأعماله في خدمة أهالي الدائرة.'
WHERE NOT EXISTS (SELECT 1 FROM public.candidate_profile);
