-- Migration: Create missing tables for Services, Logistics, and Customers

-- 1. Create public.services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Select services policy" ON public.services;
DROP POLICY IF EXISTS "Insert services policy" ON public.services;
DROP POLICY IF EXISTS "Update services policy" ON public.services;
DROP POLICY IF EXISTS "Delete services policy" ON public.services;

-- Re-create Policies
CREATE POLICY "Select services policy" ON public.services FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.services.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Insert services policy" ON public.services FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.services.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Update services policy" ON public.services FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.services.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Delete services policy" ON public.services FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.services.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);


-- 2. Create public.logistics table
CREATE TABLE IF NOT EXISTS public.logistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    tracking_id TEXT NOT NULL,
    destination TEXT,
    carrier TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'In Transit', 'Delayed', 'Delivered')),
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Select logistics policy" ON public.logistics;
DROP POLICY IF EXISTS "Insert logistics policy" ON public.logistics;
DROP POLICY IF EXISTS "Update logistics policy" ON public.logistics;
DROP POLICY IF EXISTS "Delete logistics policy" ON public.logistics;

-- Re-create Policies
CREATE POLICY "Select logistics policy" ON public.logistics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.logistics.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Insert logistics policy" ON public.logistics FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.logistics.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Update logistics policy" ON public.logistics FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.logistics.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Delete logistics policy" ON public.logistics FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.logistics.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);


-- 3. Create public.customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT DEFAULT 'B2C' CHECK (type IN ('B2C', 'B2B')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Select customers policy" ON public.customers;
DROP POLICY IF EXISTS "Insert customers policy" ON public.customers;
DROP POLICY IF EXISTS "Update customers policy" ON public.customers;
DROP POLICY IF EXISTS "Delete customers policy" ON public.customers;

-- Re-create Policies
CREATE POLICY "Select customers policy" ON public.customers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.customers.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Insert customers policy" ON public.customers FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.customers.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Update customers policy" ON public.customers FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.customers.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);

CREATE POLICY "Delete customers policy" ON public.customers FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE public.team_members.team_id = public.customers.team_id 
        AND public.team_members.user_id = auth.uid()
    )
);
