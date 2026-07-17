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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.global_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

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

-- 7. FINALLY: Make you the Global Admin!
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
