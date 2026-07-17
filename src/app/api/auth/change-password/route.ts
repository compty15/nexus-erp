import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Get current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || !user.email) {
      return NextResponse.json({ error: 'User session not found' }, { status: 401 });
    }

    // 2. Update the password with currentPassword verification
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: newPassword,
      current_password: currentPassword
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
