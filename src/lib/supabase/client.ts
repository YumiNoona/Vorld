import { createBrowserClient } from "@supabase/ssr";

let browserClient: any = null;

/**
 * Supabase client for client-side operations.
 * Returns a singleton instance to prevent re-creation in React components.
 */
export function createClient() {
  if (typeof window === "undefined") return null;

  if (browserClient) return browserClient;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables. Check your .env.local file.");
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}
