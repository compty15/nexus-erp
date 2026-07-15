-- Migration: 20260715_security_rls.sql
-- Description: Enforce Row-Level Security, setup User Profiles/Roles, and create Shared Access mappings.

-- 1. Create Profiles Table (Safely handling if it already exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add 'email' column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Safely add 'role' column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger: Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'user')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Profiles for existing users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Grant Admin role to Shane (compton248@gmail.com)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'compton248@gmail.com';

-- 2. Create Shared Access Table (Explicit account authorization)
CREATE TABLE IF NOT EXISTS public.shared_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (owner_id, viewer_id)
);

-- Enable RLS on Shared Access
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Shared Access Policies
CREATE POLICY "Users can view shared_access records they are part of"
ON public.shared_access FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = viewer_id);

CREATE POLICY "Owners can share access"
ON public.shared_access FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can revoke access"
ON public.shared_access FOR DELETE
USING (auth.uid() = owner_id);

-- 3. Enable RLS and Configure Policies for Inventory Table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select inventory policy"
ON public.inventory FOR SELECT
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.shared_access 
        WHERE public.shared_access.owner_id = public.inventory.user_id 
        AND public.shared_access.viewer_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Insert inventory policy"
ON public.inventory FOR INSERT
WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Update inventory policy"
ON public.inventory FOR UPDATE
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Delete inventory policy"
ON public.inventory FOR DELETE
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

-- 4. Enable RLS and Configure Policies for Financials Table
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select financials policy"
ON public.financials FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.inventory
        WHERE public.inventory.id = public.financials.inventory_id
        AND (
            public.inventory.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.shared_access 
                WHERE public.shared_access.owner_id = public.inventory.user_id 
                AND public.shared_access.viewer_id = auth.uid()
            )
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Insert financials policy"
ON public.financials FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.inventory
        WHERE public.inventory.id = public.financials.inventory_id
        AND public.inventory.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Update financials policy"
ON public.financials FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.inventory
        WHERE public.inventory.id = public.financials.inventory_id
        AND public.inventory.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);

CREATE POLICY "Delete financials policy"
ON public.financials FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.inventory
        WHERE public.inventory.id = public.financials.inventory_id
        AND public.inventory.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
);
