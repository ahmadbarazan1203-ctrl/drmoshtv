import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { castOf, genresQuery, slugify, type Series } from "@/lib/api";
import { genreName, useI18n } from "@/lib/i18n";
import { Button, ConfirmDelete, errToast, Field, ImageUpload, selectCls } from "./shared";

type Form = {
  id?: string; title: string; slug: string; synopsis: string; poster_url: string | null; cover_url: string | null; trailer_url: string;
  release_date: string; production_status: Series["production_status"]; production: string; keywords: string; cast: string;
  is_published: boolean; is_original: boolean; is_trending: boolean; is_latest: boolean; genres: string[];
};
const blank: Form = { title: "", slug: "", synopsis: "", poster_url: null, cover_url: null, trailer_url: "", release_date: "", production_status: "ongoing", production: "", keywords: "", cast: "", is_published: false, is_original: true, is_trending: false, is_latest: false, genres: [] };

export const adminSeriesQuery = { queryKey: ["admin", "series"], queryFn: async () => {
  const { data, error } = await supabase.from("series").select("*, series_genres(genre_id)").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
} };

export function SeriesAdmin() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: list } = useQuery(adminSeriesQuery);
  const { data: genres } = useQuery(genresQuery);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const refresh = () => qc.invalidateQueries();

  const edit = (s: NonNullable<typeof list>[number]) => setForm({
    id: s.id, title: s.title, slug: s.slug, synopsis: s.synopsis, poster_url: s.poster_url, cover_url: s.cover_url, trailer_url: s.trailer_url ?? "",
    release_date: s.release_date ?? "", production_status: s.production_status, production: s.production ?? "", keywords: s.keywords ?? "",
    cast: castOf(s).map((c) => (c.character ? `${c.name} - ${c.character}` : c.name)).join("\n"),
    is_published: s.is_published, is_original: s.is_original, is_trending: s.is_trending, is_latest: s.is_latest, genres: s.series_genres.map((g) => g.genre_id),
  });

  const save = async () => {
    if (!form) return;
    const title = form.title.trim();
    const slug = slugify(form.slug || title) || `series-${Date.now().toString(36)}`;
    if (!title || title.length > 200) return toast.error(t("f_title"));
    if (form.trailer_url && !form.trailer_url.startsWith("https://")) return toast.error("https://");
    const cast = form.cast.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 100).map((l) => { const [name, ...rest] = l.split(" - "); return { name: name.trim().slice(0, 100), character: rest.join(" - ").trim().slice(0, 100) || undefined }; });
    const row = {
      title, slug, synopsis: form.synopsis.trim().slice(0, 5000), poster_url: form.poster_url, cover_url: form.cover_url, trailer_url: form.trailer_url.trim() || null,
      release_date: form.release_date || null, release_year: form.release_date ? Number(form.release_date.slice(0, 4)) : null,
      production_status: form.production_status, production: form.production.trim().slice(0, 200) || null, keywords: form.keywords.trim().slice(0, 500) || null,
      cast_members: cast, is_published: form.is_published, is_original: form.is_original, is_trending: form.is_trending, is_latest: form.is_latest,
    };
    setBusy(true);
    const res = form.id ? await supabase.from("series").update(row).eq("id", form.id).select("id").single() : await supabase.from("series").insert(row).select("id").single();
    if (errToast(res.error)) return setBusy(false);
    const id = res.data!.id;
    await supabase.from("series_genres").delete().eq("series_id", id);
    if (form.genres.length) { const g = await supabase.from("series_genres").insert(form.genres.map((genre_id) => ({ series_id: id, genre_id }))); errToast(g.error); }
    setBusy(false);
    toast.success(t("saved"));
    setForm(null);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("series").delete().eq("id", id);
    if (!errToast(error)) { toast.success(t("delete")); refresh(); }
  };

  return (
    <div className="space-y-4">
      <Button variant="hero" onClick={() => setForm({ ...blank })}><Plus /> {t("adm_newSeries")}</Button>
      {!list?.length ? <p className="text-muted-foreground">{t("empty")}</p> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <div className="aspect-[2/3] w-16 shrink-0 overflow-hidden rounded bg-surface">{s.poster_url && <img src={s.poster_url} alt="" className="size-full object-cover" />}</div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.release_year ?? "—"} · {t(`status_${s.production_status}`)}</p>
                <p className={`text-xs ${s.is_published ? "text-success" : "text-muted-foreground"}`}>{s.is_published ? t("f_published") : t("f_draft")}</p>
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="secondary" onClick={() => edit(s)}><Pencil /> {t("edit")}</Button>
                  <ConfirmDelete onConfirm={() => remove(s.id)}><Button size="sm" variant="ghost" aria-label={t("delete")}><Trash2 className="text-destructive" /></Button></ConfirmDelete>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? t("edit") : t("adm_newSeries")}</DialogTitle></DialogHeader>
          {form && (
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="space-y-3">
                <ImageUpload label={t("f_poster")} value={form.poster_url} onChange={(v) => set("poster_url", v)} folder="posters" />
                <ImageUpload label={t("f_cover")} value={form.cover_url} onChange={(v) => set("cover_url", v)} folder="covers" aspect="aspect-video" />
              </div>
              <div className="space-y-3">
                <Field label={t("f_title")}><Input value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} /></Field>
                <Field label={t("f_slug")}><Input dir="ltr" value={form.slug} maxLength={80} placeholder={slugify(form.title)} onChange={(e) => set("slug", e.target.value)} /></Field>
                <Field label={t("f_synopsis")}><Textarea rows={4} maxLength={5000} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t("f_releaseDate")}><Input type="date" value={form.release_date} onChange={(e) => set("release_date", e.target.value)} /></Field>
                  <Field label={t("status")}>
                    <select className={selectCls} value={form.production_status} onChange={(e) => set("production_status", e.target.value as Form["production_status"])}>
                      <option value="upcoming">{t("status_upcoming")}</option><option value="ongoing">{t("status_ongoing")}</option><option value="completed">{t("status_completed")}</option>
                    </select>
                  </Field>
                  <Field label={t("production")}><Input value={form.production} maxLength={200} onChange={(e) => set("production", e.target.value)} /></Field>
                  <Field label={t("f_trailer")}><Input dir="ltr" value={form.trailer_url} maxLength={500} placeholder="https://" onChange={(e) => set("trailer_url", e.target.value)} /></Field>
                </div>
                <Field label={t("f_keywords")}><Input value={form.keywords} maxLength={500} onChange={(e) => set("keywords", e.target.value)} /></Field>
                <div className="space-y-1 text-sm">
                  <span>{t("genres")}</span>
                  <div className="flex flex-wrap gap-2">
                    {genres?.map((g) => { const on = form.genres.includes(g.id); return (
                      <button type="button" key={g.id} onClick={() => set("genres", on ? form.genres.filter((x) => x !== g.id) : [...form.genres, g.id])} className={`rounded-full px-3 py-1 text-xs ${on ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{genreName(g, lang)}</button>
                    ); })}
                  </div>
                </div>
                <Field label={t("f_cast")}><Textarea rows={3} value={form.cast} onChange={(e) => set("cast", e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {([["is_published", "f_published"], ["is_original", "f_original"], ["is_trending", "f_trending"], ["is_latest", "f_latest"]] as const).map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2"><Switch checked={form[k]} onCheckedChange={(v) => set(k, v)} />{t(l)}</label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setForm(null)}>{t("cancel")}</Button>
                  <Button variant="hero" disabled={busy} onClick={save}>{t("save")}</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
