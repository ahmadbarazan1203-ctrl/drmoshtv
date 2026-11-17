import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// The site's database, auth and storage live in the owner's own Supabase project.
// URL and publishable key are public values (data is protected by RLS).
export const DB_URL = "https://jvldekwxjcdlfysejzrg.supabase.co";
export const DB_PUBLISHABLE_KEY = "sb_publishable_EMUhps4o4zdPtnXmUXjVRw_hD81ICgR";

function keyFetch(k: string): typeof fetch {
  return (input, init) => {
    const h = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((v, n) => h.set(n, v));
    if (!k.startsWith("eyJ") && h.get("Authorization") === `Bearer ${k}`) h.delete("Authorization");
    h.set("apikey", k);
    return fetch(input, { ...init, headers: h });
  };
}
export { keyFetch };

export const supabase = createClient<Database>(DB_URL, DB_PUBLISHABLE_KEY, {
  global: { fetch: keyFetch(DB_PUBLISHABLE_KEY) },
  auth: { persistSession: typeof window !== "undefined", autoRefreshToken: typeof window !== "undefined", storageKey: "drmosh-auth" },
});
