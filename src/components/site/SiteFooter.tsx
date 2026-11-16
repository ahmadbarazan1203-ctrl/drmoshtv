import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = useI18n();
  const { data: s } = useQuery(settingsQuery);
  const social = (s?.social_links ?? {}) as Record<string, string>;
  const links = Object.entries(social).filter(([, v]) => typeof v === "string" && v.startsWith("https://"));
  return (
    <footer className="mt-20 border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="space-y-3">
          <Logo className="h-8" />
          <p className="max-w-sm text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        {(s?.contact_email || s?.contact_phone) && (
          <div className="space-y-2 text-sm">
            <h3 className="font-medium">{t("contact")}</h3>
            {s?.contact_email && <a href={`mailto:${s.contact_email}`} className="block text-muted-foreground hover:text-foreground">{s.contact_email}</a>}
            {s?.contact_phone && <a href={`tel:${s.contact_phone}`} dir="ltr" className="block text-muted-foreground hover:text-foreground">{s.contact_phone}</a>}
          </div>
        )}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            {links.map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1.5 capitalize text-muted-foreground hover:border-primary hover:text-foreground">{k}</a>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-border/40 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brand")} — {t("rights")}. {t("footerNote")}
      </div>
    </footer>
  );
}
