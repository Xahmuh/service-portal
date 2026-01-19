-- 1. Enable Database Webhooks (if not enabled)
-- This allows Supabase to send external requests to email providers like Resend/SendGrid via Edge Functions
-- ALTER SYSTEM SET "supabase.webhooks" = 'on';

-- 2. Create the notification logic function
CREATE OR REPLACE FUNCTION public.handle_request_updates_notification()
RETURNS TRIGGER AS $$
DECLARE
    citizen_email TEXT;
    citizen_name TEXT;
    status_label TEXT;
BEGIN
    -- Get citizen info
    SELECT email, name INTO citizen_email, citizen_name 
    FROM public.profiles 
    WHERE user_id = NEW.citizen_id;

    -- Map status to Arabic label
    status_label := CASE NEW.status
        WHEN 'new' THEN 'جديد'
        WHEN 'in_review' THEN 'قيد المراجعة'
        WHEN 'in_progress' THEN 'قيد التنفيذ'
        WHEN 'responded' THEN 'تم الرد'
        WHEN 'closed' THEN 'مغلق'
        WHEN 'cancelled' THEN 'ملغي'
        ELSE NEW.status::TEXT
    END;

    -- Insert into system notifications (Internal Relay)
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.system_notifications (user_id, title, message, type)
        VALUES (
            NEW.citizen_id,
            'تحديث حالة الطلب',
            'تم تحديث حالة طلبك رقم ' || NEW.reference_number || ' إلى ' || status_label,
            'info'
        );
        
        -- Note: To send a real email, you would link this table to a Supabase Edge Function
        -- or use Supabase's built-in "Webhooks" feature in the dashboard.
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for Request Status Change
DROP TRIGGER IF EXISTS tr_notify_request_update ON public.requests;
CREATE TRIGGER tr_notify_request_update
    AFTER UPDATE OF status ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_request_updates_notification();

-- 4. Trigger for New Replies (Notify Citizen)
CREATE OR REPLACE FUNCTION public.handle_new_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
    req_ref TEXT;
    citizen_uid UUID;
BEGIN
    -- Get request reference and citizen ID
    SELECT reference_number, citizen_id INTO req_ref, citizen_uid 
    FROM public.requests 
    WHERE id = NEW.request_id;

    -- If the reply is from staff/candidate (not internal), notify the citizen
    IF (NEW.sender_role IN ('staff', 'candidate', 'admin') AND NOT NEW.is_internal) THEN
        INSERT INTO public.system_notifications (user_id, title, message, type)
        VALUES (
            citizen_uid,
            'رد جديد على طلبك',
            'تمت إضافة رد جديد من فريق العمل على طلبك رقم ' || req_ref,
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_reply ON public.replies;
CREATE TRIGGER tr_notify_new_reply
    AFTER INSERT ON public.replies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_reply_notification();
