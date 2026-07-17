import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/shared/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Initialize Supabase client with bypass of RLS (using Service Role Key)
function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isPlaceholder = !serviceKey || serviceKey === 'your-service-role-key';
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isPlaceholder ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : serviceKey
  );
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Requesting User
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Authorization Check (Admin Only)
    const email = user.email || '';
    const role = user.user_metadata?.role || '';
    const isAdmin = email.includes('admin') || 
                    email === 'compt15@gmail.com' || 
                    email === 'compty15@gmail.com' || 
                    email === 'compton248@gmail.com' || 
                    role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Admin Query (RLS bypassed)
    const adminSupabase = createAdminClient();

    // Fetch Auth Users to get email addresses and names
    const userMap: Record<string, { email: string; name: string }> = {};
    try {
      const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
      if (!listError && users) {
        users.forEach((u: any) => {
          userMap[u.id] = {
            email: u.email || '',
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Unknown User'
          };
        });
      }
    } catch (authListError) {
      console.warn('[admin/usage] Could not list auth users (using RLS bypass fallback):', authListError);
    }

    // Fetch all inventory items (cost metadata and creation dates)
    const { data: items, error: itemsError } = await adminSupabase
      .from('inventory')
      .select('user_id, cost_metadata, created_at');

    if (itemsError) throw itemsError;

    // 4. Aggregate Cost Data
    const breakdowns: Record<string, {
      user_id: string;
      name: string;
      email: string;
      total_cost: number;
      months: Record<string, number>;
    }> = {};

    items?.forEach((item: any) => {
      const userId = item.user_id;
      if (!userId) return;

      if (!breakdowns[userId]) {
        const mappedUser = userMap[userId] || { email: 'N/A', name: `User (${userId.substring(0, 8)})` };
        breakdowns[userId] = {
          user_id: userId,
          name: mappedUser.name,
          email: mappedUser.email,
          total_cost: 0,
          months: {}
        };
      }

      const cost = item.cost_metadata?.total_scan_cost || 0;
      const dateStr = item.created_at || new Date().toISOString();
      const month = dateStr.substring(0, 7); // format: YYYY-MM

      breakdowns[userId].total_cost += cost;
      breakdowns[userId].months[month] = (breakdowns[userId].months[month] || 0) + cost;
    });

    const result = Object.values(breakdowns).sort((a, b) => b.total_cost - a.total_cost);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Admin Usage Endpoint Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
