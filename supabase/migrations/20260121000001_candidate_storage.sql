
-- Create a bucket for candidate assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-assets', 'candidate-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access control for the bucket
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'candidate-assets' );

-- Allow admins to upload/update/delete
CREATE POLICY "Admin Manage Assets"
ON storage.objects FOR ALL
USING (
    bucket_id = 'candidate-assets' 
    AND (
        public.has_role(auth.uid(), 'admin') 
        OR public.has_role(auth.uid(), 'candidate')
    )
);
