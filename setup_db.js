const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.qwyabndajfhpnrgzgrge:zuCmyd-zercaw-cunju0@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  try {
    const res = await client.query("SELECT id FROM auth.users WHERE email = 'compton248@gmail.com'");
    if (res.rows.length === 0) {
      console.error("User not found!");
      return;
    }
    const realId = res.rows[0].id;
    console.log("Using Real ID:", realId);

    const sql = `
-- 0. Clean up old tables
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.logistics CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;

-- 1. Global Admins (Tier 1)
CREATE TABLE IF NOT EXISTS public.global_admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Teams (Workspaces)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- 3. Team Members (Tier 2 and Tier 3 mappings)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- 4. ERP Tables
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10, 2),
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    type TEXT,
    provider TEXT,
    estimated_cost DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS public.logistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tracking_id TEXT NOT NULL,
    carrier TEXT,
    status TEXT DEFAULT 'pending',
    eta TIMESTAMP WITH TIME ZONE,
    destination TEXT
);

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    type TEXT CHECK (type IN ('B2B', 'B2C')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    total_volume DECIMAL(12, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invitee_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.app_config (
    id TEXT PRIMARY KEY,
    config_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.global_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 6. Helper function to check team membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_team_member(team_id UUID, user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = $1 AND team_members.user_id = $2
    );
END;
$$ LANGUAGE plpgsql;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Admins can read admin list" ON public.global_admins;
CREATE POLICY "Admins can read admin list" ON public.global_admins FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
CREATE POLICY "Users can view teams they belong to" ON public.teams FOR SELECT USING (
    owner_id = auth.uid() OR public.is_team_member(id, auth.uid())
);

DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Only owners can update teams" ON public.teams;
CREATE POLICY "Only owners can update teams" ON public.teams FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view members of their teams" ON public.team_members;
CREATE POLICY "Users can view members of their teams" ON public.team_members FOR SELECT USING (
    public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Owners can add members" ON public.team_members;
CREATE POLICY "Owners can add members" ON public.team_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can remove members" ON public.team_members;
CREATE POLICY "Owners can remove members" ON public.team_members FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Team members can access items" ON public.items;
CREATE POLICY "Team members can access items" ON public.items FOR ALL USING (
    public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Team members can access services" ON public.services;
CREATE POLICY "Team members can access services" ON public.services FOR ALL USING (
    public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Team members can access logistics" ON public.logistics;
CREATE POLICY "Team members can access logistics" ON public.logistics FOR ALL USING (
    public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Team members can access customers" ON public.customers;
CREATE POLICY "Team members can access customers" ON public.customers FOR ALL USING (
    public.is_team_member(team_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view invites they sent" ON public.invites;
CREATE POLICY "Users can view invites they sent" ON public.invites FOR SELECT USING (
    auth.uid() = inviter_id
);

DROP POLICY IF EXISTS "Users can create invites for their team" ON public.invites;
CREATE POLICY "Users can create invites for their team" ON public.invites FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE teams.id = invites.team_id AND teams.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Allow select on app_config for everyone" ON public.app_config;
CREATE POLICY "Allow select on app_config for everyone" ON public.app_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage app_config" ON public.app_config;
CREATE POLICY "Admins can manage app_config" ON public.app_config FOR ALL USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

-- Seed app_config with default billing and system statuses
INSERT INTO public.app_config (id, config_value)
VALUES 
('billing_status', '{"total_budget": 500, "remaining_balance": 500, "total_spent": 0, "last_usage": "Never"}'),
('system_status', '{"state": "Active", "reason": "No policy violations detected", "last_updated": "2026-07-16"}')
ON CONFLICT (id) DO NOTHING;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Seed profiles for existing users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Seed admin role in profiles
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'compton248@gmail.com';

-- 7. Grant schema, table, and sequence access privileges to authenticated/anon users
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- 8. FINALLY: Make you the Global Admin!
INSERT INTO public.global_admins (id) 
VALUES ('${realId}') ON CONFLICT (id) DO NOTHING;
  `;
  
    await client.query(sql);
    console.log("SUCCESS! FULL SCHEMA DEPLOYED AND ADMIN CREATED!");
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
