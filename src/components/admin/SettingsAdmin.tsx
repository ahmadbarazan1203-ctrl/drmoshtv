import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/db";
import { settingsQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Button, ConfirmDelete, errToast, Field, ImageUpload } from "./shared";

const SOCIALS = ["instagram", "youtube", "tiktok", "x", "facebook", "telegram"];

export function SettingsAdmin() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: s } = useQuery(settingsQuery);
  const { data: anns } = useQuery({ queryKey: ["admin", "ann"], queryFn: async () => (await supabase.from("announcements").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [f, setF] = useState({ site_name: "", site_description: "", seo_title: "", seo_description: "", og_image: null as string | null, contact_email: "", contact_phone: "", social: {} as Record<string, string> });
  const [msg, setMsg] = useState("");
  useEffect(() => { if (s) setF({ site_name: s.site_name, site_description: s.site_description, seo_title: s.seo_title, seo_description: s.seo_description, og_image: s.og_image, contact_email: s.contact_email ?? "", contact_phone: s.contact_phone ?? "", social: (s.social_links ?? {}) as Record<string, string> }); }, [s]);

  const save = async () => {
    for (const v of Object.values(f.social)) if (v && !v.startsWith("https://")) return toast.error("https://");
    if (f.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact_email)) return toast.error(t("s_contactEmail"));
    const { error } = await supabase.from("platform_settings").update({
      site_name: f.site_name.trim().slice(0, 100), site_description: f.site_description.trim().slice(0, 500), seo_title: f.seo_title.trim().slice(0, 70), seo_description: f.seo_description.trim().slice(0, 160),
      og_image: f.og_image, contact_email: f.contact_email.trim() || null, contact_phone: f.contact_phone.trim().slice(0, 30) || null,
      social_links: Object.fromEntries(Object.entries(f.social).filter(([, v]) => v.trim())),
    }).eq("id", 1);
    if (!errToast(error)) { toast.success(t("saved")); qc.invalidateQueries(); }
    return undefined;
  };
  const addAnn = async () => {
    if (!msg.trim()) return;
    const { error } = await supabase.from("announcements").insert({ message: msg.trim().slice(0, 300) });
    if (!errToast(error)) { setMsg(""); toast.success(t("saved")); qc.invalidateQueries(); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Field label={t("s_siteName")}><Input value={f.site_name} maxLength={100} onChange={(e) => setF({ ...f, site_name: e.target.value })} /></Field>
        <Field label={t("s_siteDesc")}><Textarea rows={2} maxLength={500} value={f.site_description} onChange={(e) => setF({ ...f, site_description: e.target.value })} /></Field>
        <Field label={t("s_seoTitle")}><Input value={f.seo_title} maxLength={70} onChange={(e) => setF({ ...f, seo_title: e.target.value })} /></Field>
        <Field label={t("s_seoDesc")}><Textarea rows={2} maxLength={160} value={f.seo_description} onChange={(e) => setF({ ...f, seo_description: e.target.value })} /></Field>
        <div className="max-w-xs"><ImageUpload label={t("s_ogImage")} value={f.og_image} onChange={(v) => setF({ ...f, og_image: v })} folder="og" aspect="aspect-[1200/630]" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("s_contactEmail")}><Input type="email" dir="ltr" value={f.contact_email} maxLength={255} onChange={(e) => setF({ ...f, contact_email: e.target.value })} /></Field>
          <Field label={t("s_contactPhone")}><Input dir="ltr" value={f.contact_phone} maxLength={30} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} /></Field>
        </div>
        <p className="pt-2 text-sm">{t("s_social")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOCIALS.map((k) => <Input key={k} dir="ltr" placeholder={`${k} — https://`} value={f.social[k] ?? ""} maxLength={300} onChange={(e) => setF({ ...f, social: { ...f.social, [k]: e.target.value } })} />)}
        </div>
        <Button variant="hero" onClick={save}>{t("save")}</Button>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-medium">{t("s_announcements")}</h2>
        <div className="flex gap-2"><Input value={msg} maxLength={300} placeholder={t("s_newAnnouncement")} onChange={(e) => setMsg(e.target.value)} /><Button variant="hero" onClick={addAnn}>{t("add")}</Button></div>
        <ul className="divide-y divide-border text-sm">
          {anns?.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2">
              <span className="flex-1">{a.message}</span>
              <label className="flex items-center gap-1 text-xs"><Switch checked={a.is_active} onCheckedChange={async (v) => { const { error } = await supabase.from("announcements").update({ is_active: v }).eq("id", a.id); if (!errToast(error)) qc.invalidateQueries(); }} />{t("s_active")}</label>
              <ConfirmDelete onConfirm={async () => { const { error } = await supabase.from("announcements").delete().eq("id", a.id); if (!errToast(error)) qc.invalidateQueries(); }}><Button size="sm" variant="ghost" aria-label={t("delete")}><Trash2 className="text-destructive" /></Button></ConfirmDelete>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
