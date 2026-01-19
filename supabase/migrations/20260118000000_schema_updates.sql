-- Add 'admin' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Add national_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id TEXT UNIQUE;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_notifications table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'candidate'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.system_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Update handle_new_user function to include national_id from metadata if available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone, national_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'national_id'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add district to areas
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS district TEXT;

-- Insert Mansoura Locations (East)
INSERT INTO public.areas (name, district) VALUES
  ('قولنجيل', 'حي شرق المنصورة'),
  ('جديلة', 'حي شرق المنصورة'),
  ('قناة السويس', 'حي شرق المنصورة'),
  ('توريل القديمة', 'حي شرق المنصورة'),
  ('توريل الجديدة', 'حي شرق المنصورة'),
  ('الدراسات', 'حي شرق المنصورة'),
  ('كفر البدماص', 'حي شرق المنصورة'),
  ('عزبة الشال', 'حي شرق المنصورة'),
  ('عزبة الصفيح', 'حي شرق المنصورة'),
  ('عزبة الهويس', 'حي شرق المنصورة'),
  ('مجمع المحاكم', 'حي شرق المنصورة'),
  ('مدينة مبارك', 'حي شرق المنصورة'),
  ('تقسيم أبوالليل', 'حي شرق المنصورة'),
  ('مدينة السلام', 'حي شرق المنصورة'),
  ('المرور', 'حي شرق المنصورة'),
  ('المختلط', 'حي شرق المنصورة'),
  ('مساكن الشناوي', 'حي شرق المنصورة'),
  ('عزبة عقل', 'حي شرق المنصورة'),
  ('شارع ١٠', 'حي شرق المنصورة'),
  ('الجوازات', 'حي شرق المنصورة'),
  ('المديرية', 'حي شرق المنصورة');

-- Insert Mansoura Locations (West)
INSERT INTO public.areas (name, district) VALUES
  ('سندوب', 'حي غرب المنصورة'),
  ('عزبة الحلواني', 'حي غرب المنصورة'),
  ('المجزر', 'حي غرب المنصورة'),
  ('مدينة الفردوس', 'حي غرب المنصورة'),
  ('حي الأشجار', 'حي غرب المنصورة'),
  ('عبدالسلام عارف', 'حي غرب المنصورة'),
  ('الترعة', 'حي غرب المنصورة'),
  ('الصدر', 'حي غرب المنصورة'),
  ('النخلة', 'حي غرب المنصورة'),
  ('آداب', 'حي غرب المنصورة'),
  ('الثانوية', 'حي غرب المنصورة'),
  ('الجلاء', 'حي غرب المنصورة'),
  ('الحوار', 'حي غرب المنصورة'),
  ('محمد فتحي', 'حي غرب المنصورة'),
  ('الطميهي', 'حي غرب المنصورة'),
  ('العباسي', 'حي غرب المنصورة'),
  ('المدير', 'حي غرب المنصورة'),
  ('بورسعيد', 'حي غرب المنصورة'),
  ('السلخانة', 'حي غرب المنصورة'),
  ('الشيخ حسانين', 'حي غرب المنصورة'),
  ('السكة الجديدة', 'حي غرب المنصورة'),
  ('السكة القديمة', 'حي غرب المنصورة'),
  ('ميت حدر', 'حي غرب المنصورة'),
  ('بنك مصر', 'حي غرب المنصورة'),
  ('الحسينية', 'حي غرب المنصورة'),
  ('حسين بك', 'حي غرب المنصورة'),
  ('المشاية (علوي)', 'حي غرب المنصورة'),
  ('المشاية (سفلي)', 'حي غرب المنصورة'),
  ('جيهان', 'حي غرب المنصورة'),
  ('حي الجامعة', 'حي غرب المنصورة'),
  ('الزعفران', 'حي غرب المنصورة'),
  ('أحمد ماهر', 'حي غرب المنصورة'),
  ('تقسيم سامية الجمل', 'حي غرب المنصورة'),
  ('تقسيم خطاب', 'حي غرب المنصورة');
