import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. App will not function correctly.');
}

// Single instance for the client side utilizing @supabase/ssr cookie syncing
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookieOptions: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    }
  }
);
