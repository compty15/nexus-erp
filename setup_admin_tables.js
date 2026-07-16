const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.qwyabndajfhpnrgzgrge:zuCmyd-zercaw-cunju0@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  const sql = `
CREATE TABLE IF NOT EXISTS public.global_contractors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    hourly_rate DECIMAL(10, 2),
    phone TEXT,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.global_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tier_name TEXT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    description TEXT
);

ALTER TABLE public.global_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_commissions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage global_contractors" ON public.global_contractors FOR ALL USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);
CREATE POLICY "Admins can manage global_commissions" ON public.global_commissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

-- Everyone can read contractors and commissions
CREATE POLICY "Anyone can read global_contractors" ON public.global_contractors FOR SELECT USING (true);
CREATE POLICY "Anyone can read global_commissions" ON public.global_commissions FOR SELECT USING (true);
  `;
  
  try {
    await client.query(sql);
    console.log("SUCCESS! Admin tables created.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
