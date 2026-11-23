import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/db";
import { genresQuery, slugify, type Genre } from "@/lib/api";
import { genreGroup } from "@/lib/home-sections";
import { genreName, useI18n } from "@/lib/i18n";
import { Button, ConfirmDelete, errToast, Field } from "./shared";

type GenreForm = {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  name_tr: string;
};

const blank: GenreForm = { slug: "", name_ar: "", name_en: "", name_fr: "", name_tr: "" };

export function GenresAdmin() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: genres } = useQuery(genresQuery);
  const [form, setForm] = useState<GenreForm | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof GenreForm, value: string) => setForm((current) => current ? { ...current, [key]: value } : current);
  const refresh = () => qc.invalidateQueries({ queryKey: ["genres"] });

  const save = async () => {
    if (!form) return;
    const nameAr = form.name_ar.trim();
    if (!nameAr) return toast.error(t("f_genreNameRequired"));
    const group = genreGroup({ ...form, slug: form.slug.trim() });
    const slug = slugify(form.slug) || slugify(form.name_en) || group || `genre-${Date.now().toString(36)}`;
    const row = {
      slug,
      name_ar: nameAr.slice(0, 100),
      name_en: (form.name_en.trim() || nameAr).slice(0, 100),
      name_fr: (form.name_fr.trim() || nameAr).slice(0, 100),
      name_tr: (form.name_tr.trim() || nameAr).slice(0, 100),
    };
    setBusy(true);
    const result = form.id
      ? await supabase.from("genres").update(row).eq("id", form.id)
      : await supabase.from("genres").insert(row);
    setBusy(false);
    if (errToast(result.error)) return;
    toast.success(t("saved"));
    setForm(null);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("genres").delete().eq("id", id);
    if (!errToast(error)) {
      toast.success(t("delete"));
      refresh();
    }
  };

  const edit = (genre: Genre) => setForm({
    id: genre.id,
    slug: genre.slug,
    name_ar: genre.name_ar,
    name_en: genre.name_en,
    name_fr: genre.name_fr,
    name_tr: genre.name_tr,
  });

  return (
    <div className="space-y-4">
      <Button variant="hero" onClick={() => setForm({ ...blank })}><Plus /> {t("adm_newGenre")}</Button>
      <p className="max-w-3xl text-sm text-muted-foreground">{t("adm_genreHint")}</p>
      {!genres?.length ? <p className="text-muted-foreground">{t("empty")}</p> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {genres.map((genre) => (
            <div key={genre.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{genreName(genre, lang)}</p>
                <p dir="ltr" className="truncate text-xs text-muted-foreground">{genre.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="secondary" onClick={() => edit(genre)}><Pencil /> {t("edit")}</Button>
                <ConfirmDelete onConfirm={() => remove(genre.id)}><Button size="sm" variant="ghost" aria-label={t("delete")}><Trash2 className="text-destructive" /></Button></ConfirmDelete>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!form} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? t("edit") : t("adm_newGenre")}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("f_genreNameAr")}><Input value={form.name_ar} maxLength={100} onChange={(event) => set("name_ar", event.target.value)} /></Field>
                <Field label={t("f_genreNameEn")}><Input dir="ltr" value={form.name_en} maxLength={100} onChange={(event) => set("name_en", event.target.value)} /></Field>
                <Field label={t("f_genreNameFr")}><Input dir="ltr" value={form.name_fr} maxLength={100} onChange={(event) => set("name_fr", event.target.value)} /></Field>
                <Field label={t("f_genreNameTr")}><Input dir="ltr" value={form.name_tr} maxLength={100} onChange={(event) => set("name_tr", event.target.value)} /></Field>
              </div>
              <Field label={t("f_genreSlug")}><Input dir="ltr" value={form.slug} maxLength={80} placeholder="family" onChange={(event) => set("slug", event.target.value)} /></Field>
              <div className="flex justify-end gap-2">
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
