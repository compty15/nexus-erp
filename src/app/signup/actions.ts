'use server';

import { createClient } from '@/shared/lib/supabase-server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const reqHeaders = await headers();
  const host = reqHeaders.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http:' : 'https:';
  const siteUrl = `${protocol}//${host}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to a check-email page or back to login with a message
  redirect('/login?message=Check your email to confirm your account.');
}
