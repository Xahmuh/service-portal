
-- Add auth columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider_id TEXT;

-- Update handle_new_user to capture provider and log audit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  provider text;
BEGIN
  provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  INSERT INTO public.profiles (user_id, name, email, phone, national_id, auth_provider, provider_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'national_id',
    provider,
    NEW.raw_user_meta_data->>'provider_id'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  -- Audit Log
  INSERT INTO public.audit_logs (user_id, action, entity_type, metadata)
  VALUES (
    NEW.id,
    'signup',
    'auth_provider',
    jsonb_build_object('provider', provider, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
