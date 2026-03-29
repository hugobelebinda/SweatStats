/**
 * Supabase entry points for SweatStats.
 * - Browser: `createClient` from `./supabase/client` (safe with RLS when policies allow).
 * - Server mutations with Strava tokens: `createAdminClient` from `./supabase/admin` (never import in client components).
 */
export { createClient } from "./supabase/client";
export { createAdminClient } from "./supabase/admin";
