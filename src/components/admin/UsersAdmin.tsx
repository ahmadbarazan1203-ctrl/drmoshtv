import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button, errToast } from "./shared";

export function UsersAdmin() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return { profiles: p.data ?? [], roles: r.data ?? [] };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });
  const suspend = async (id: string, v: boolean) => { const { error } = await supabase.from("profiles").update({ suspended: v }).eq("id", id); if (!errToast(error)) { toast.success(t("saved")); refresh(); } };
  const setAdmin = async (id: string, v: boolean) => {
    const { error } = v ? await supabase.from("user_roles").insert({ user_id: id, role: "admin" }) : await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
    if (!errToast(error)) { toast.success(t("saved")); refresh(); }
  };
  if (!data?.profiles.length) return <p className="text-muted-foreground">{t("empty")}</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs text-muted-foreground"><tr><th className="p-3 text-start">{t("email")}</th><th className="p-3 text-start">{t("adm_role")}</th><th className="p-3 text-start">{t("adm_joined")}</th><th /></tr></thead>
        <tbody className="divide-y divide-border">
          {data.profiles.map((p) => {
            const admin = data.roles.some((r) => r.user_id === p.id && r.role === "admin");
            const self = p.id === user?.id;
            return (
              <tr key={p.id} className="bg-card">
                <td className="p-3"><p>{p.email}</p><p className="text-xs text-muted-foreground">{p.display_name}</p></td>
                <td className="p-3">{admin ? "admin" : "user"}{p.suspended && <span className="ms-2 text-destructive">({t("adm_suspend")})</span>}</td>
                <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="space-x-1 p-3 text-end whitespace-nowrap">
                  {!self && <Button size="sm" variant="secondary" onClick={() => setAdmin(p.id, !admin)}>{admin ? t("adm_removeAdmin") : t("adm_makeAdmin")}</Button>}
                  {!self && <Button size="sm" variant={p.suspended ? "secondary" : "destructive"} onClick={() => suspend(p.id, !p.suspended)}>{p.suspended ? t("adm_unsuspend") : t("adm_suspend")}</Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
