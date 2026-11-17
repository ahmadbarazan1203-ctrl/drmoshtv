import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseImageUrl } from "@/lib/media-url";
import { useServerFn } from "@tanstack/react-start";
import { uploadImage } from "@/lib/ext-storage.functions";
import { useI18n } from "@/lib/i18n";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

export function ImageUpload({ value, onChange, folder, label, aspect = "aspect-[2/3]" }: { value: string | null; onChange: (url: string | null) => void; folder: string; label: string; aspect?: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(value ?? "");
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setLink(value ?? ""); setImageFailed(false); }, [value]);
  const applyLink = () => {
    const url = parseImageUrl(link);
    if (!url) return toast.error(t("f_invalidImageUrl"));
    setImageFailed(false);
    onChange(url);
  };
  const upload = useServerFn(uploadImage);
  const onFile = async (f: File) => {
    if (!ALLOWED.includes(f.type)) return toast.error("JPG / PNG / WEBP");
    if (f.size > MAX) return toast.error("Max 5MB");
    setBusy(true);
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      const r = await upload({ data: { folder, type: f.type, base64: btoa(bin) } });
      onChange(r.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
    return undefined;
  };
  return (
    <div className="space-y-1 text-sm">
      <span>{label}</span>
      <label className={`relative flex ${aspect} w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface hover:border-primary`}>
        {value && !imageFailed ? <img src={value} alt="" className="size-full object-cover" onError={() => setImageFailed(true)} /> : <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground"><Upload className="size-5" />{imageFailed ? t("f_imageUnavailable") : busy ? t("f_uploading") : t("f_upload")}</span>}
        {busy && value && <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs">{t("f_uploading")}</span>}
        <input type="file" accept={ALLOWED.join(",")} className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </label>
      <label className="block space-y-1">
        <span>{t("f_imageUrl")}</span>
        <Input type="url" dir="ltr" value={link} maxLength={4000} onChange={(e) => setLink(e.target.value)} disabled={busy} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={applyLink} disabled={busy || !link.trim()}>{t("f_applyUrl")}</Button>
        {value && <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)} className="text-destructive">{t("delete")}</Button>}
      </div>
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
