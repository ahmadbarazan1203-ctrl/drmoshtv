import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export function DailyBars({ days }: { days: number }) {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["admin", "daily", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_daily_views", { _days: days });
      if (error) throw error;
      return data ?? [];
    },
  });
  if (!data) return <div className="h-40" />;
  const max = Math.max(1, ...data.map((d) => Number(d.views)));
  const total = data.reduce((a, d) => a + Number(d.views), 0);
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  return (
    <div className="flex h-40 items-end gap-0.5" dir="ltr">
      {data.map((d) => (
        <div key={d.day} title={`${d.day}: ${d.views}`} className="flex-1 rounded-t bg-gradient-primary" style={{ height: `${(Number(d.views) / max) * 100}%`, minHeight: 2 }} />
      ))}
    </div>
  );
}

export function AnalyticsAdmin() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const [s, e, total, monthly] = await Promise.all([
        supabase.from("series").select("id,title,views").order("views", { ascending: false }).limit(10),
        supabase.from("episodes").select("id,title,episode_number,views,series:series_id(title)").order("views", { ascending: false }).limit(10),
        supabase.from("view_events").select("id", { count: "exact", head: true }),
        supabase.rpc("admin_daily_views", { _days: 365 }),
      ]);
      const byMonth = new Map<string, number>();
      for (const d of monthly.data ?? []) byMonth.set(d.day.slice(0, 7), (byMonth.get(d.day.slice(0, 7)) ?? 0) + Number(d.views));
      return { series: s.data ?? [], episodes: e.data ?? [], total: total.count ?? 0, months: [...byMonth.entries()].slice(-12) };
    },
  });
  const maxM = Math.max(1, ...(data?.months.map((m) => m[1]) ?? [1]));
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">{t("adm_totalViews")}</p>
        <p className="text-3xl font-bold">{data?.total ?? "—"}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4"><h2 className="mb-3 font-medium">{t("adm_daily")}</h2><DailyBars days={30} /></div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-medium">{t("adm_monthly")}</h2>
        <ul className="space-y-1 text-sm" dir="ltr">
          {data?.months.map(([m, v]) => (
            <li key={m} className="flex items-center gap-3"><span className="w-16 text-muted-foreground">{m}</span><div className="h-3 rounded bg-gradient-primary" style={{ width: `${(v / maxM) * 100}%`, minWidth: 2 }} /><span className="tabular-nums">{v}</span></li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Top title={t("adm_mostSeries")} rows={data?.series.map((s) => ({ id: s.id, name: s.title, v: s.views })) ?? []} />
        <Top title={t("adm_mostEpisodes")} rows={data?.episodes.map((e) => ({ id: e.id, name: `${(e.series as { title: string } | null)?.title ?? ""} — ${e.episode_number}. ${e.title}`, v: e.views })) ?? []} />
      </div>
    </div>
  );
}

function Top({ title, rows }: { title: string; rows: { id: string; name: string; v: number }[] }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 font-medium">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
        <ol className="divide-y divide-border text-sm">{rows.map((r, i) => <li key={r.id} className="flex justify-between gap-2 py-2"><span className="truncate">{i + 1}. {r.name}</span><span className="tabular-nums text-muted-foreground">{r.v}</span></li>)}</ol>
      )}
    </div>
  );
}
