import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DB_URL, DB_PUBLISHABLE_KEY, keyFetch } from "@/lib/db";

// Server side: verify the caller's token against the owner's Supabase project.
export const requireDbAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const auth = getRequest()?.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new Error("Unauthorized");
  const supabase = createClient<Database>(DB_URL, DB_PUBLISHABLE_KEY, {
    global: { fetch: keyFetch(DB_PUBLISHABLE_KEY), headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return next({ context: { supabase, userId: data.user.id } });
});

export function dbAdmin() {
  const key = process.env["EXT_STORAGE_SERVICE_KEY"];
  if (!key) throw new Error("Storage not configured");
  return createClient<Database>(DB_URL, key, { global: { fetch: keyFetch(key) }, auth: { persistSession: false, autoRefreshToken: false } });
}
