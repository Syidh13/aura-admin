import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for server components / route handlers. Reads + writes
 * session cookies via Next.js cookies(). Use this for any RPC call from
 * the server side.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll fails when called from a Server Component that doesn't
            // own the response (e.g. RSC during render). Middleware refreshes
            // cookies so this is OK to swallow.
          }
        },
      },
    },
  );
}
