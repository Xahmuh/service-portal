
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('citizen', 'staff', 'candidate');

-- Create request_status enum
CREATE TYPE public.request_status AS ENUM ('new', 'in_review', 'in_progress', 'responded', 'closed');

-- Create request_priority enum
CREATE TYPE public.request_priority AS ENUM ('low', 'medium', 'high');

-- Create news_status enum
CREATE TYPE public.news_status AS ENUM ('draft', 'scheduled', 'published');

-- Create news_type enum
CREATE TYPE public.news_type AS ENUM ('statement', 'service_update', 'achievement', 'event', 'alert', 'awareness');

-- Create areas table
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  area_id UUID REFERENCES public.areas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  assigned_area_id UUID REFERENCES public.areas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create request_types table
CREATE TABLE public.request_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_id UUID REFERENCES public.areas(id) NOT NULL,
  type_id UUID REFERENCES public.request_types(id) NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'new',
  priority request_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create replies table
CREATE TABLE public.replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_role app_role NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type news_type NOT NULL DEFAULT 'statement',
  area_id UUID REFERENCES public.areas(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status news_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Function to get user's assigned area
CREATE OR REPLACE FUNCTION public.get_user_assigned_area(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT assigned_area_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to check if user is staff or candidate
CREATE OR REPLACE FUNCTION public.is_staff_or_candidate(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('staff', 'candidate')
  )
$$;

-- Areas policies (public read, staff/candidate manage)
CREATE POLICY "Anyone can view areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Candidates can manage areas" ON public.areas FOR ALL USING (public.has_role(auth.uid(), 'candidate'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (public.is_staff_or_candidate(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies (only candidate can manage)
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'candidate'));
CREATE POLICY "Candidates can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'candidate'));

-- Request types policies
CREATE POLICY "Anyone can view request types" ON public.request_types FOR SELECT USING (true);
CREATE POLICY "Candidates can manage request types" ON public.request_types FOR ALL USING (public.has_role(auth.uid(), 'candidate'));

-- Requests policies
CREATE POLICY "Citizens can view own requests" ON public.requests FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Staff can view assigned area requests" ON public.requests FOR SELECT 
  USING (public.is_staff_or_candidate(auth.uid()) AND (
    public.has_role(auth.uid(), 'candidate') OR 
    area_id = public.get_user_assigned_area(auth.uid())
  ));
CREATE POLICY "Citizens can create requests" ON public.requests FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Staff can update requests" ON public.requests FOR UPDATE 
  USING (public.is_staff_or_candidate(auth.uid()) AND (
    public.has_role(auth.uid(), 'candidate') OR 
    area_id = public.get_user_assigned_area(auth.uid())
  ));

-- Replies policies
CREATE POLICY "Request owner can view replies" ON public.replies FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND citizen_id = auth.uid()) OR
    (public.is_staff_or_candidate(auth.uid()) AND NOT is_internal) OR
    (public.is_staff_or_candidate(auth.uid()) AND is_internal)
  );
CREATE POLICY "Citizens can view non-internal replies" ON public.replies FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND citizen_id = auth.uid()) AND NOT is_internal
  );
CREATE POLICY "Anyone can create replies on accessible requests" ON public.replies FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (
        r.citizen_id = auth.uid() OR
        public.is_staff_or_candidate(auth.uid())
      )
    )
  );

-- Attachments policies
CREATE POLICY "Users can view attachments on accessible requests" ON public.attachments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (
        r.citizen_id = auth.uid() OR
        public.is_staff_or_candidate(auth.uid())
      )
    )
  );
CREATE POLICY "Users can upload attachments" ON public.attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- News policies
CREATE POLICY "Anyone can view published news" ON public.news FOR SELECT 
  USING (status = 'published' OR public.is_staff_or_candidate(auth.uid()));
CREATE POLICY "Staff/Candidate can manage news" ON public.news FOR ALL 
  USING (public.is_staff_or_candidate(auth.uid()));

-- Insert default areas
INSERT INTO public.areas (name) VALUES
  ('المنطقة الشرقية'),
  ('المنطقة الغربية'),
  ('المنطقة الشمالية'),
  ('المنطقة الجنوبية'),
  ('المنطقة الوسطى');

-- Insert default request types
INSERT INTO public.request_types (name) VALUES
  ('خدمات صحية'),
  ('خدمات تعليمية'),
  ('خدمات بنية تحتية'),
  ('خدمات اجتماعية'),
  ('شكوى'),
  ('اقتراح'),
  ('أخرى');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
