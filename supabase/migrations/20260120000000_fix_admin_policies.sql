
-- Update is_staff_or_candidate to include 'admin'
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
      AND role IN ('staff', 'candidate', 'admin')
  )
$$;

-- Update Requests Policies to include 'admin'
-- 1. For SELECT
DROP POLICY IF EXISTS "Staff can view assigned area requests" ON public.requests;
CREATE POLICY "Staff can view assigned area requests" ON public.requests FOR SELECT 
  USING (
    public.is_staff_or_candidate(auth.uid()) AND (
      public.has_role(auth.uid(), 'candidate') OR 
      public.has_role(auth.uid(), 'admin') OR 
      area_id = public.get_user_assigned_area(auth.uid())
    )
  );

-- 2. For UPDATE
DROP POLICY IF EXISTS "Staff can update requests" ON public.requests;
CREATE POLICY "Staff can update requests" ON public.requests FOR UPDATE 
  USING (
    public.is_staff_or_candidate(auth.uid()) AND (
      public.has_role(auth.uid(), 'candidate') OR 
      public.has_role(auth.uid(), 'admin') OR 
      area_id = public.get_user_assigned_area(auth.uid())
    )
  );

-- Update user_roles policies to include 'admin'
DROP POLICY IF EXISTS "Candidates can manage roles" ON public.user_roles;
CREATE POLICY "Admins/Candidates can manage roles" ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'candidate') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Candidates can view all roles" ON public.user_roles;
CREATE POLICY "Admins/Candidates can view all roles" ON public.user_roles FOR SELECT 
  USING (public.has_role(auth.uid(), 'candidate') OR public.has_role(auth.uid(), 'admin'));

-- Update areas and request_types management policies
DROP POLICY IF EXISTS "Candidates can manage areas" ON public.areas;
CREATE POLICY "Admins/Candidates can manage areas" ON public.areas FOR ALL 
  USING (public.has_role(auth.uid(), 'candidate') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Candidates can manage request_types" ON public.request_types;
CREATE POLICY "Admins/Candidates can manage request_types" ON public.request_types FOR ALL 
  USING (public.has_role(auth.uid(), 'candidate') OR public.has_role(auth.uid(), 'admin'));
