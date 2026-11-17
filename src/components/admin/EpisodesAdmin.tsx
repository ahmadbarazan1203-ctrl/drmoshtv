import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/db";
import { parseVideo } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { adminSeriesQuery } from "./SeriesAdmin";
import { Button, ConfirmDelete, errToast, Field, ImageUpload, selectCls } from "./shared";

type Form = { id?: string; season_number: number; episode_number: number; title: string; description: string; thumbnail_url: string | null; video_url: string; duration_minutes: string; is_published: boolean; publish_at: string };

function toLocal(iso: string) { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }

export function EpisodesAdmin() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: series } = useQuery(adminSeriesQuery);
  const [sid, setSid] = useState<string>("");
  useEffect(() => { if (!sid && series?.[0]) setSid(series[0].id); }, [series, sid]);
  const { data } = useQuery({
    queryKey: ["admin", "episodes", sid],
    enabled: !!sid,
    queryFn: async () => {
      const [s, e] = await Promise.all([
        supabase.from("seasons").select("*").eq("series_id", sid).order("season_number"),
        supabase.from("episodes").select("*").eq("series_id", sid).order("episode_number"),
      ]);
      return { seasons: s.data ?? [], episodes: e.data ?? [] };
    },
  });
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const seasonNum = new Map(data?.seasons.map((s) => [s.id, s.season_number]));

  const newEp = () => {
    const lastSeason = data?.seasons.at(-1)?.season_number ?? 1;
    const inLast = data?.episodes.filter((e) => seasonNum.get(e.season_id) === lastSeason).length ?? 0;
    setForm({ season_number: lastSeason, episode_number: inLast + 1, title: "", description: "", thumbnail_url: null, video_url: "", duration_minutes: "", is_published: false, publish_at: toLocal(new Date().toISOString()) });
  };

  const save = async () => {
    if (!form || !sid) return;
    const title = form.title.trim();
    if (!title) return toast.error(t("f_title"));
    if (form.video_url && !parseVideo(form.video_url.trim())) return toast.error(t("f_videoUrl"));
    if (form.season_number < 1 || form.episode_number < 1) return toast.error(t("f_episodeNumber"));
    setBusy(true);
    let season = data?.seasons.find((s) => s.season_number === form.season_number);
    if (!season) {
      const r = await supabase.from("seasons").insert({ series_id: sid, season_number: form.season_number }).select("*").single();
      if (errToast(r.error)) return setBusy(false);
      season = r.data!;
    }
    const row = {
      series_id: sid, season_id: season.id, episode_number: form.episode_number, title: title.slice(0, 200), description: form.description.trim().slice(0, 5000),
      thumbnail_url: form.thumbnail_url, video_url: form.video_url.trim() || null, duration_minutes: form.duration_minutes ? Math.max(0, Math.min(1000, Number(form.duration_minutes))) : null,
      is_published: form.is_published, publish_at: new Date(form.publish_at).toISOString(),
    };
    const r = form.id ? await supabase.from("episodes").update(row).eq("id", form.id) : await supabase.from("episodes").insert(row);
    setBusy(false);
    if (errToast(r.error)) return;
    toast.success(t("saved"));
    setForm(null);
    qc.invalidateQueries();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (!errToast(error)) { toast.success(t("delete")); qc.invalidateQueries(); }
  };

  if (!series?.length) return <p className="text-muted-foreground">{t("empty")} — {t("adm_newSeries")}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label={t("f_seriesPick")}>
          <select className={`${selectCls} min-w-56`} value={sid} onChange={(e) => setSid(e.target.value)}>
            {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Button variant="hero" onClick={newEp}><Plus /> {t("adm_newEpisode")}</Button>
      </div>
      {!data?.episodes.length ? <p className="text-muted-foreground">{t("empty")}</p> : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {[...data.episodes].sort((a, b) => (seasonNum.get(a.season_id) ?? 0) - (seasonNum.get(b.season_id) ?? 0) || a.episode_number - b.episode_number).map((e) => {
                const scheduled = e.is_published && new Date(e.publish_at) > new Date();
                return (
                  <tr key={e.id} className="bg-card">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">S{seasonNum.get(e.season_id)} · E{e.episode_number}</td>
                    <td className="p-3">{e.title}</td>
                    <td className={`p-3 whitespace-nowrap ${scheduled ? "text-primary-glow" : e.is_published ? "text-success" : "text-muted-foreground"}`}>{scheduled ? `${t("f_scheduled")} ${new Date(e.publish_at).toLocaleString()}` : e.is_published ? t("f_published") : t("f_draft")}</td>
                    <td className="p-3 whitespace-nowrap text-end">
                      <Button size="sm" variant="secondary" onClick={() => setForm({ id: e.id, season_number: seasonNum.get(e.season_id) ?? 1, episode_number: e.episode_number, title: e.title, description: e.description, thumbnail_url: e.thumbnail_url, video_url: e.video_url ?? "", duration_minutes: e.duration_minutes?.toString() ?? "", is_published: e.is_published, publish_at: toLocal(e.publish_at) })}><Pencil /></Button>
                      <ConfirmDelete onConfirm={() => remove(e.id)}><Button size="sm" variant="ghost" aria-label={t("delete")}><Trash2 className="text-destructive" /></Button></ConfirmDelete>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? t("edit") : t("adm_newEpisode")}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Field label={t("f_seasonNumber")}><Input type="number" min={1} value={form.season_number} onChange={(e) => set("season_number", Number(e.target.value))} /></Field>
                <Field label={t("f_episodeNumber")}><Input type="number" min={1} value={form.episode_number} onChange={(e) => set("episode_number", Number(e.target.value))} /></Field>
                <Field label={t("f_duration")}><Input type="number" min={0} value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} /></Field>
              </div>
              <Field label={t("f_title")}><Input value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} /></Field>
              <Field label={t("f_synopsis")}><Textarea rows={3} maxLength={5000} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
              <Field label={t("f_videoUrl")}><Input dir="ltr" value={form.video_url} maxLength={1000} placeholder="https://" onChange={(e) => set("video_url", e.target.value)} /></Field>
              <div className="max-w-xs"><ImageUpload label={t("f_thumbnail")} value={form.thumbnail_url} onChange={(v) => set("thumbnail_url", v)} folder="thumbnails" aspect="aspect-video" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("f_publishAt")}><Input type="datetime-local" value={form.publish_at} onChange={(e) => set("publish_at", e.target.value)} /></Field>
                <label className="flex items-center gap-2 pt-6 text-sm"><Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />{t("f_published")}</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Button>
                <Button variant="hero" disabled={busy} onClick={save}>{t("save")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
