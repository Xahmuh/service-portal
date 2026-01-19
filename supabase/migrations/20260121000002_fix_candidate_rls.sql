
-- Simplify RLS policies for candidate_profile to ensure they work correctly
DROP POLICY IF EXISTS "Admins can manage candidate profile" ON public.candidate_profile;
CREATE POLICY "Admins/Candidates can manage candidate profile" 
ON public.candidate_profile FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'candidate')
  )
);

-- Simplify RLS policies for candidate_achievements
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.candidate_achievements;
CREATE POLICY "Admins/Candidates can manage achievements" 
ON public.candidate_achievements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'candidate')
  )
);

-- Ensure the storage bucket exists and policies are correct
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('candidate-assets', 'candidate-assets', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Fix storage policies (replace existing ones to be sure)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Assets" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'candidate-assets' );

CREATE POLICY "Admin Manage Assets"
ON storage.objects FOR ALL
USING (
    bucket_id = 'candidate-assets' 
    AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'candidate')
    )
);
