import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { Stat } from "./shared";
import { DailyBars } from "./AnalyticsAdmin";

export function Overview() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [s, e, u, v, rs, re] = await Promise.all([
        supabase.from("series").select("id", { count: "exact", head: true }),
        supabase.from("episodes").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("view_events").select("id", { count: "exact", head: true }),
        supabase.from("series").select("id,title,created_at,is_published").order("created_at", { ascending: false }).limit(5),
        supabase.from("episodes").select("id,title,episode_number,created_at,is_published").order("created_at", { ascending: false }).limit(5),
      ]);
      return { series: s.count ?? 0, episodes: e.count ?? 0, users: u.count ?? 0, views: v.count ?? 0, recentS: rs.data ?? [], recentE: re.data ?? [] };
    },
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("adm_totalSeries")} value={data?.series ?? "—"} />
        <Stat label={t("adm_totalEpisodes")} value={data?.episodes ?? "—"} />
        <Stat label={t("adm_totalUsers")} value={data?.users ?? "—"} />
        <Stat label={t("adm_totalViews")} value={data?.views ?? "—"} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-medium">{t("adm_activity")}</h2>
        <DailyBars days={30} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[{ title: t("adm_series"), rows: data?.recentS.map((r) => ({ id: r.id, name: r.title, pub: r.is_published, at: r.created_at })) },
          { title: t("adm_episodes"), rows: data?.recentE.map((r) => ({ id: r.id, name: `${r.episode_number}. ${r.title}`, pub: r.is_published, at: r.created_at })) }].map((b) => (
          <div key={b.title} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-medium">{t("adm_recent")} — {b.title}</h2>
            {!b.rows?.length ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
              <ul className="divide-y divide-border text-sm">
                {b.rows.map((r) => (
                  <li key={r.id} className="flex justify-between gap-2 py-2">
                    <span className="truncate">{r.name}</span>
                    <span className={r.pub ? "text-success" : "text-muted-foreground"}>{r.pub ? t("f_published") : t("f_draft")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
