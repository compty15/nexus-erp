import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not logged in and tries to access restricted paths, redirect to login
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Exclude static assets from middleware checks, handled in the matcher below but good to have a backup
  if (
    !user &&
    !isAuthRoute &&
    !isApiRoute
  ) {
    // no user, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Admin access only for /admin route
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    // Basic admin check (if you want to restrict to a specific email later)
    // if (user.email !== process.env.ADMIN_EMAIL) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = '/';
    //   return NextResponse.redirect(url);
    // }
  }

  // If user is logged in, and tries to go to login page, redirect to items
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
