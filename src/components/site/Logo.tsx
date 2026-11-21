import { useI18n } from "@/lib/i18n";

export function Logo({ className = "h-8" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span dir="ltr" role="img" aria-label={t("brand")} className={`${className} inline-flex items-center whitespace-nowrap text-lg font-bold leading-none tracking-tight md:text-xl`}>
      <span className="text-gradient">{t("brand")}</span>
    </span>
  );
}
