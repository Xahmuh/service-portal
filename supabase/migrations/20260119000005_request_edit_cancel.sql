-- إضافة ميزة تعديل وإلغاء الطلبات

-- 1. إضافة حالة "ملغي" لحالات الطلب
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'cancelled';

-- 2. تحديث سياسات RLS للسماح بالتعديل (خلال 6 ساعات)
DROP POLICY IF EXISTS "Citizens can update own requests within 6 hours" ON public.requests;
CREATE POLICY "Citizens can update own requests within 6 hours"
ON public.requests
FOR UPDATE
USING (
  auth.uid() = citizen_id 
  AND created_at > (NOW() - INTERVAL '6 hours')
  AND status NOT IN ('cancelled', 'closed')
)
WITH CHECK (
  auth.uid() = citizen_id 
  AND created_at > (NOW() - INTERVAL '6 hours')
  AND status NOT IN ('cancelled', 'closed')
);

-- 3. السماح بإلغاء الطلب في أي وقت (تحديث الحالة إلى cancelled)
DROP POLICY IF EXISTS "Citizens can cancel own requests anytime" ON public.requests;
CREATE POLICY "Citizens can cancel own requests anytime"
ON public.requests
FOR UPDATE
USING (
  auth.uid() = citizen_id 
  AND status NOT IN ('cancelled', 'closed')
)
WITH CHECK (
  auth.uid() = citizen_id 
  AND status = 'cancelled'
);

-- 4. إضافة دالة للتحقق من إمكانية التعديل
CREATE OR REPLACE FUNCTION public.can_edit_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    citizen_id = auth.uid() 
    AND created_at > (NOW() - INTERVAL '6 hours')
    AND status NOT IN ('cancelled', 'closed')
  FROM public.requests
  WHERE id = request_id;
$$;

-- 5. إضافة دالة للتحقق من إمكانية الإلغاء
CREATE OR REPLACE FUNCTION public.can_cancel_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    citizen_id = auth.uid() 
    AND status NOT IN ('cancelled', 'closed')
  FROM public.requests
  WHERE id = request_id;
$$;
