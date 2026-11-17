import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/lib/db";

// Client side: attach the signed-in user's token to server function calls.
export const attachDbAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
