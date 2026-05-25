import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth + role proxy (renamed from middleware in Next 16). Runs on every
 * request to:
 *   1. Refresh the session cookie (server-side)
 *   2. Gate non-login routes behind a super_admin session check
 *
 * Public routes: /login. Everything else requires super_admin.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';

  // Not logged in → bounce to /login (except already on /login).
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Logged in → check role. Bounce non-super_admin to /login with error.
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const isSuperAdmin = profile?.role === 'super_admin';

    if (!isSuperAdmin) {
      // Sign out + redirect to login with explanation
      await supabase.auth.signOut();
      if (!isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'not_admin');
        return NextResponse.redirect(url);
      }
    } else if (isLoginPage) {
      // Already logged in as admin → kick into dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public/ files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
