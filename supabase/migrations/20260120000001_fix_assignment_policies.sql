
-- 1. تحديث سياسة رؤية الطلبات لتشمل التكليفات الشخصية (assigned_to)
DROP POLICY IF EXISTS "Staff can view assigned area requests" ON public.requests;
CREATE POLICY "Staff can view assigned area requests" ON public.requests FOR SELECT 
  USING (
    public.is_staff_or_candidate(auth.uid()) AND (
      public.has_role(auth.uid(), 'candidate') OR 
      public.has_role(auth.uid(), 'admin') OR 
      area_id = public.get_user_assigned_area(auth.uid()) OR
      assigned_to = auth.uid() -- السماح للموظف برؤية ما تم تكليفه به شخصياً
    )
  );

-- 2. تحديث سياسة التحديث لتشمل الموظف المكلف بالطلب
DROP POLICY IF EXISTS "Staff can update requests" ON public.requests;
CREATE POLICY "Staff can update requests" ON public.requests FOR UPDATE 
  USING (
    public.is_staff_or_candidate(auth.uid()) AND (
      public.has_role(auth.uid(), 'candidate') OR 
      public.has_role(auth.uid(), 'admin') OR 
      area_id = public.get_user_assigned_area(auth.uid()) OR
      assigned_to = auth.uid() -- السماح للموظف بتحديث ما تم تكليفه به
    )
  );
