import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/api";
import { useI18n, type TKey } from "@/lib/i18n";
import { adminSeriesQuery } from "./SeriesAdmin";
import { Button, errToast, Field, selectCls } from "./shared";

const SECTIONS: TKey[] = ["latest", "trending", "popular", "recent_episodes", "recommended", "originals", "genres"];

export function HomepageAdmin() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: series } = useQuery(adminSeriesQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: featured } = useQuery({ queryKey: ["admin", "featured"], queryFn: async () => (await supabase.from("featured_content").select("*").eq("slot", "hero").limit(1)).data ?? [] });
  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => { if (settings) setOrder([...settings.section_order, ...SECTIONS.filter((s) => !settings.section_order.includes(s))]); }, [settings]);

  const setHero = async (id: string) => {
    const del = await supabase.from("featured_content").delete().eq("slot", "hero");
    if (errToast(del.error)) return;
    if (id) { const r = await supabase.from("featured_content").insert({ slot: "hero", series_id: id, position: 0 }); if (errToast(r.error)) return; }
    toast.success(t("saved"));
    qc.invalidateQueries();
  };
  const move = (i: number, d: number) => { const n = [...order]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; setOrder(n); };
  const saveOrder = async () => {
    const { error } = await supabase.from("platform_settings").update({ section_order: order }).eq("id", 1);
    if (!errToast(error)) { toast.success(t("saved")); qc.invalidateQueries(); }
  };
  const toggle = async (id: string, k: "is_trending" | "is_latest", v: boolean) => {
    const { error } = await supabase.from("series").update({ [k]: v }).eq("id", id);
    if (!errToast(error)) qc.invalidateQueries();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <Field label={t("adm_featured")}>
            <select className={selectCls} value={featured?.[0]?.series_id ?? ""} onChange={(e) => setHero(e.target.value)}>
              <option value="">{t("adm_none")}</option>
              {series?.filter((s) => s.is_published).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </Field>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm">{t("adm_sectionOrder")}</h2>
          <ol className="space-y-1">
            {order.map((k, i) => (
              <li key={k} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                <span>{i + 1}. {t(k as TKey)}</span>
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" aria-label="up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp /></Button>
                  <Button size="sm" variant="ghost" aria-label="down" onClick={() => move(i, 1)} disabled={i === order.length - 1}><ArrowDown /></Button>
                </span>
              </li>
            ))}
          </ol>
          <Button variant="hero" className="mt-3" onClick={saveOrder}>{t("save")}</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-3 text-xs text-muted-foreground"><span /><span>{t("f_trending")}</span><span>{t("f_latest")}</span></div>
        {!series?.length ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
          <ul className="divide-y divide-border">
            {series.map((s) => (
              <li key={s.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-6 py-2 text-sm">
                <span className="truncate">{s.title}{!s.is_published && <span className="text-muted-foreground"> ({t("f_draft")})</span>}</span>
                <Switch checked={s.is_trending} onCheckedChange={(v) => toggle(s.id, "is_trending", v)} />
                <Switch checked={s.is_latest} onCheckedChange={(v) => toggle(s.id, "is_latest", v)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
