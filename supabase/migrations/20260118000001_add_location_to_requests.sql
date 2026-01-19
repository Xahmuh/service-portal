-- Add location columns to requests table
ALTER TABLE public.requests
ADD COLUMN latitude FLOAT8,
ADD COLUMN longitude FLOAT8,
ADD COLUMN location_address TEXT;

-- Update RLS if necessary (though it should be covered by existing policies)
COMMENT ON COLUMN public.requests.latitude IS 'Optional latitude for geographic location';
COMMENT ON COLUMN public.requests.longitude IS 'Optional longitude for geographic location';
COMMENT ON COLUMN public.requests.location_address IS 'Optional formatted address for location';
