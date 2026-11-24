import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { slugify, type Genre } from "@/lib/api";
import { supabase } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { Button, errToast } from "./shared";

export function GenreQuickAdd({ onCreated }: { onCreated: (genre: Genre) => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const value = name.trim();
    if (!value) {
      toast.error(t("f_genreNameRequired"));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.from("genres").insert({
      slug: slugify(value) || `genre-${Date.now().toString(36)}`,
      name_ar: value.slice(0, 100),
      name_en: value.slice(0, 100),
      name_fr: value.slice(0, 100),
      name_tr: value.slice(0, 100),
    }).select("*").single();
    setBusy(false);
    if (errToast(error)) return;
    if (!data) {
      toast.error(t("error"));
      return;
    }
    toast.success(t("saved"));
    setName("");
    onCreated(data);
    await qc.invalidateQueries({ queryKey: ["genres"] });
  };

  return (
    <div className="flex gap-2">
      <Input
        aria-label={t("adm_newGenre")}
        value={name}
        maxLength={100}
        placeholder={t("f_newGenreInline")}
        disabled={busy}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      />
      <Button type="button" variant="secondary" disabled={busy || !name.trim()} onClick={save}>
        <Plus /> {t("add")}
      </Button>
    </div>
  );
}
