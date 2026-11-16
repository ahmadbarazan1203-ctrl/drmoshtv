import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border/50" : "bg-gradient-to-b from-background/90 to-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 md:px-8">
        <Link to="/" aria-label={t("brand")} className="shrink-0"><Logo className="h-7 md:h-9" /></Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link to="/" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>{t("home")}</Link>
          <Link to="/search" search={{ q: "", genre: "", sort: "newest" }} className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground">{t("browse")}</Link>
        </nav>
        <form
          className="ms-auto flex flex-1 max-w-sm items-center gap-2 rounded-full border border-border bg-surface/70 px-3"
          onSubmit={(e) => { e.preventDefault(); nav({ to: "/search", search: { q: q.trim(), genre: "", sort: "newest" } }); }}
          role="search"
        >
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} aria-label={t("search")} className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" maxLength={100} />
        </form>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
