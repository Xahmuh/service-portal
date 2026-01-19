
-- Create enums for gender and marital status if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status_type') THEN
        CREATE TYPE marital_status_type AS ENUM ('single', 'married', 'divorced', 'widowed');
    END IF;
END $$;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender gender_type,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS marital_status marital_status_type,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update handle_new_user function to include new fields from metadata if available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    name, 
    email, 
    phone, 
    national_id, 
    gender, 
    job_title, 
    marital_status, 
    address
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'national_id',
    (NEW.raw_user_meta_data->>'gender')::gender_type,
    NEW.raw_user_meta_data->>'job_title',
    (NEW.raw_user_meta_data->>'marital_status')::marital_status_type,
    NEW.raw_user_meta_data->>'address'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
