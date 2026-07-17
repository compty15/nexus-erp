import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Security headers applied to every response
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Routes that unauthenticated users may visit
const AUTH_ROUTES = ['/login', '/auth', '/join'];

// Sanitize the ?next= redirect param to prevent open redirects
function sanitizeNextUrl(next: string | null): string {
  if (!next) return '/';
  try {
    // Only allow relative paths (no protocol, no external domains)
    const url = new URL(next, 'http://localhost');
    if (url.hostname !== 'localhost') return '/';
    return url.pathname + url.search;
  } catch {
    return '/';
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          } catch {
            // Intentionally swallowed — middleware cookie errors are non-fatal
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isApiRoute  = pathname.startsWith('/api');
  const isStatic    = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  // Apply security headers to all non-static responses
  if (!isStatic) {
    Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
      supabaseResponse.headers.set(key, val);
    });
  }

  // Unauthenticated user accessing a protected route → login
  if (!user && !isAuthRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    const next = sanitizeNextUrl(pathname);
    url.pathname = '/login';
    if (next !== '/') url.searchParams.set('next', next);
    const redirectResponse = NextResponse.redirect(url);
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => redirectResponse.headers.set(k, v));
    return redirectResponse;
  }

  // Admin route — only users with role=admin in user_metadata may access
  if (user && pathname.startsWith('/admin')) {
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Authenticated user visiting an auth route → back to dashboard
  // (exclude /join so logged-in users can still accept team invites)
  if (user && isAuthRoute && !pathname.startsWith('/join')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
