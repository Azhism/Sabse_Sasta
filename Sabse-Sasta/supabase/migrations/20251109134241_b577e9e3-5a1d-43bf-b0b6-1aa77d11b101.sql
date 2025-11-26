-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('vendor', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  vendor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create vendor_uploads table for tracking Excel uploads
CREATE TABLE public.vendor_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on vendor_uploads
ALTER TABLE public.vendor_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_uploads
CREATE POLICY "Vendors can view their own uploads"
ON public.vendor_uploads
FOR SELECT
USING (public.has_role(auth.uid(), 'vendor') AND auth.uid() = vendor_id);

CREATE POLICY "Vendors can create their own uploads"
ON public.vendor_uploads
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'vendor') AND auth.uid() = vendor_id);

-- Create storage bucket for vendor uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-uploads', 'vendor-uploads', false);

-- Storage policies for vendor uploads
CREATE POLICY "Vendors can upload their files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-uploads' 
  AND public.has_role(auth.uid(), 'vendor')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-uploads'
  AND public.has_role(auth.uid(), 'vendor')
  AND auth.uid()::text = (storage.foldername(name))[1]
);