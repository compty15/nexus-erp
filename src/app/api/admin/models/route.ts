import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/shared/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isPlaceholder = !serviceKey || serviceKey === 'your-service-role-key';
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isPlaceholder ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : serviceKey
  );
}

export async function POST(req: NextRequest) {
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

    // 3. Parse Request Payload
    const { model_id, is_enabled } = await req.json();
    if (!model_id || typeof is_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 4. Update model state (RLS bypassed via Admin Client)
    const adminSupabase = createAdminClient();
    
    // Seed/Insert the model if it is missing, or update if exists
    const { error: upsertError } = await adminSupabase
      .from('model_stats')
      .upsert(
        { model_id, is_enabled, updated_at: new Date().toISOString() },
        { onConflict: 'model_id' }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, model_id, is_enabled });

  } catch (error: any) {
    console.error('Admin Model API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
