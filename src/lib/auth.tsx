import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; isAdmin: boolean; loading: boolean };
const Ctx = createContext<AuthState>({ user: null, isAdmin: false, loading: true });

export async function checkIsAdmin(userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, loading: true });
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;
      const isAdmin = user ? await checkIsAdmin(user.id) : false;
      if (alive) setState({ user, isAdmin, loading: false });
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") load();
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
