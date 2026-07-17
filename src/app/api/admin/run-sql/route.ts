import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET() {
  // Use Client config object with literal IPv6 to prevent DNS resolution failures
  const client = new Client({
    host: '2600:1f1c:825:9500:ca7d:5fe:8f85:ab5a',
    port: 5432,
    user: 'postgres',
    password: 'zuCmyd-zercaw-cunju0',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const sql = `
      -- 1. Drop existing policies to prevent conflicts
      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

      DROP POLICY IF EXISTS "Select inventory policy" ON public.inventory;
      DROP POLICY IF EXISTS "Insert inventory policy" ON public.inventory;
      DROP POLICY IF EXISTS "Update inventory policy" ON public.inventory;
      DROP POLICY IF EXISTS "Delete inventory policy" ON public.inventory;

      DROP POLICY IF EXISTS "Select financials policy" ON public.financials;
      DROP POLICY IF EXISTS "Insert financials policy" ON public.financials;
      DROP POLICY IF EXISTS "Update financials policy" ON public.financials;
      DROP POLICY IF EXISTS "Delete financials policy" ON public.financials;

      -- 2. Re-create Profiles Policies (No recursive select)
      CREATE POLICY "Users can view their own profile" 
      ON public.profiles FOR SELECT 
      USING (auth.uid() = id);

      CREATE POLICY "Admins can view all profiles" 
      ON public.profiles FOR SELECT 
      USING (
        (auth.jwt() ->> 'email') = 'compton248@gmail.com'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Users can update their own profile" 
      ON public.profiles FOR UPDATE 
      USING (auth.uid() = id);

      -- 3. Re-create Inventory Policies (No query recursion on profiles)
      CREATE POLICY "Select inventory policy"
      ON public.inventory FOR SELECT
      USING (
          auth.uid() = user_id 
          OR EXISTS (
              SELECT 1 FROM public.shared_access 
              WHERE public.shared_access.owner_id = public.inventory.user_id 
              AND public.shared_access.viewer_id = auth.uid()
          )
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Insert inventory policy"
      ON public.inventory FOR INSERT
      WITH CHECK (
          auth.uid() = user_id 
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Update inventory policy"
      ON public.inventory FOR UPDATE
      USING (
          auth.uid() = user_id 
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Delete inventory policy"
      ON public.inventory FOR DELETE
      USING (
          auth.uid() = user_id 
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      -- 4. Re-create Financials Policies (No query recursion on profiles)
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
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Insert financials policy"
      ON public.financials FOR INSERT
      WITH CHECK (
          EXISTS (
              SELECT 1 FROM public.inventory
              WHERE public.inventory.id = public.financials.inventory_id
              AND public.inventory.user_id = auth.uid()
          )
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      CREATE POLICY "Update financials policy"
      ON public.financials FOR UPDATE
      USING (
          EXISTS (
              SELECT 1 FROM public.inventory
              WHERE public.inventory.id = public.financials.inventory_id
              AND public.inventory.user_id = auth.uid()
          )
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );

      -- 5. Re-create Financials Delete Policy
      CREATE POLICY "Delete financials policy"
      ON public.financials FOR DELETE
      USING (
          EXISTS (
              SELECT 1 FROM public.inventory
              WHERE public.inventory.id = public.financials.inventory_id
              AND public.inventory.user_id = auth.uid()
          )
          OR (auth.jwt() ->> 'email') = 'compton248@gmail.com'
          OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );
    `;
    
    await client.query(sql);
    await client.end();
    
    return NextResponse.json({ success: true, message: 'Database RLS policies successfully updated!' });
  } catch (error: any) {
    try { await client.end(); } catch (e) {}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
