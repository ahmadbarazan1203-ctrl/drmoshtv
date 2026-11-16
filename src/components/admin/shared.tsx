import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

export function ImageUpload({ value, onChange, folder, label, aspect = "aspect-[2/3]" }: { value: string | null; onChange: (url: string | null) => void; folder: string; label: string; aspect?: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const onFile = async (f: File) => {
    if (!ALLOWED.includes(f.type)) return toast.error("JPG / PNG / WEBP");
    if (f.size > MAX) return toast.error("Max 5MB");
    setBusy(true);
    const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("media").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
    if (up.error) { setBusy(false); return toast.error(up.error.message); }
    const signed = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (signed.error) return toast.error(signed.error.message);
    onChange(signed.data.signedUrl);
    return undefined;
  };
  return (
    <div className="space-y-1 text-sm">
      <span>{label}</span>
      <label className={`relative flex ${aspect} w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface hover:border-primary`}>
        {value ? <img src={value} alt="" className="size-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground"><Upload className="size-5" />{busy ? t("f_uploading") : t("f_upload")}</span>}
        {busy && value && <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs">{t("f_uploading")}</span>}
        <input type="file" accept={ALLOWED.join(",")} className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </label>
      {value && <button type="button" onClick={() => onChange(null)} className="text-xs text-destructive">{t("delete")}</button>}
    </div>
  );
}

export function ConfirmDelete({ onConfirm, children }: { onConfirm: () => void; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirmDelete")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1 text-sm"><span>{label}</span>{children}</label>;
}

export const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function errToast(e: { message: string } | null) {
  if (e) { toast.error(e.message); return true; }
  return false;
}

export { Button };
