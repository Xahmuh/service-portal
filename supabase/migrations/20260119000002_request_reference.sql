-- Add reference_number to requests
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Function to generate reference number
CREATE OR REPLACE FUNCTION public.generate_request_reference()
RETURNS TRIGGER AS $$
DECLARE
  new_ref TEXT;
  year_prefix TEXT;
  counter INT;
BEGIN
  year_prefix := to_char(now(), 'YY');
  
  -- Get count of requests for this year to make it sequential
  SELECT COUNT(*) + 1 INTO counter 
  FROM public.requests 
  WHERE created_at >= date_trunc('year', now());
  
  new_ref := year_prefix || '-' || LPAD(counter::TEXT, 5, '0');
  
  -- Ensure uniqueness if something went wrong
  WHILE EXISTS (SELECT 1 FROM public.requests WHERE reference_number = new_ref) LOOP
    counter := counter + 1;
    new_ref := year_prefix || '-' || LPAD(counter::TEXT, 5, '0');
  END LOOP;
  
  NEW.reference_number := new_ref;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference on insert
CREATE TRIGGER tr_generate_reference
BEFORE INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.generate_request_reference();
