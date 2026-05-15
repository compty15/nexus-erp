-- NEXUS ERP: Multi-Tenant Hardening Migration

-- 1. Create Profiles table (Standard Supabase Auth extension)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create User Settings table (isolated per-user)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_system TEXT DEFAULT 'imperial' CHECK (unit_system IN ('imperial', 'metric')),
    default_fee_percent NUMERIC(5, 2) DEFAULT 13.25,
    ebay_api_key TEXT,
    etsy_api_key TEXT,
    shopify_api_key TEXT,
    shopify_store_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Branches to include user_id for isolation
-- Since branches already exists, we add the column and set it to a default or nullable
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 4. Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- 5. Isolated RLS Policies
-- Profiles
CREATE POLICY "Profiles are private to owner" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- User Settings
CREATE POLICY "Settings are private to owner" ON public.user_settings
    FOR ALL USING (auth.uid() = id);

-- Branches
CREATE POLICY "Branches are private to creator" ON public.branches
    FOR ALL USING (auth.uid() = user_id);

-- System Metrics (Shared read, restricted write if needed, but we'll make it private for now)
ALTER TABLE public.system_metrics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
CREATE POLICY "Metrics are private to user" ON public.system_metrics
    FOR ALL USING (auth.uid() = user_id);

-- 6. Storage Isolation Hardening
-- We switch from "Public" to "Authenticated & Isolated"
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public View" ON storage.objects;

-- Allow users to upload to their own folder: bucket/user_id/...
CREATE POLICY "Isolated User Uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'raw_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view only their own folder
CREATE POLICY "Isolated User View"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'raw_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Isolated User Delete"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'raw_images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
