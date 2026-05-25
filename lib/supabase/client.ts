import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for the browser (client components).
 * Uses cookies for session persistence so middleware can read auth state.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
