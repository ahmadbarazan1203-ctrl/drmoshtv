import { setupAdminAccount } from "@/lib/admin-setup.functions";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, Film, Home, LayoutDashboard, ListVideo, LogOut, Settings, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useI18n, type TKey } from "@/lib/i18n";
import { Overview } from "./Overview";
import { SeriesAdmin } from "./SeriesAdmin";
import { EpisodesAdmin } from "./EpisodesAdmin";
import { HomepageAdmin } from "./HomepageAdmin";
import { UsersAdmin } from "./UsersAdmin";
import { AnalyticsAdmin } from "./AnalyticsAdmin";
import { SettingsAdmin } from "./SettingsAdmin";

const TABS: { id: string; label: TKey; icon: typeof Film }[] = [
  { id: "overview", label: "adm_overview", icon: LayoutDashboard },
  { id: "series", label: "adm_series", icon: Film },
  { id: "episodes", label: "adm_episodes", icon: ListVideo },
  { id: "home", label: "adm_home", icon: Home },
  { id: "users", label: "adm_users", icon: Users },
  { id: "analytics", label: "adm_analytics", icon: BarChart3 },
  { id: "settings", label: "adm_settings", icon: Settings },
];

export function AdminApp() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState("overview");
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">…</div>;
  if (!user) return <AdminLogin />;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>{t("forbidden")}</p>
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>{t("signOut")}</Button>
      </div>
    );
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-card md:sticky md:top-0 md:h-screen md:w-60 md:border-e md:border-b-0">
        <div className="flex items-center justify-between p-4"><Logo className="h-7" /><span className="md:hidden"><LanguageSwitcher /></span></div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${tab === id ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <Icon className="size-4" /> {t(label)}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-2 p-4 md:block">
          <LanguageSwitcher />
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}><LogOut /> {t("signOut")}</Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t(TABS.find((x) => x.id === tab)!.label)}</h1>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => supabase.auth.signOut()}><LogOut /></Button>
        </div>
        {tab === "overview" && <Overview />}
        {tab === "series" && <SeriesAdmin />}
        {tab === "episodes" && <EpisodesAdmin />}
        {tab === "home" && <HomepageAdmin />}
        {tab === "users" && <UsersAdmin />}
        {tab === "analytics" && <AnalyticsAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </main>
    </div>
  );
}

function AdminLogin() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"in" | "forgot" | "setup">("in");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "setup") {
      try {
        await setupAdminAccount({ data: { email: email.trim(), password: pw } });
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) toast.error(error.message);
      } catch (err) { toast.error((err as Error).message); }
    } else if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) toast.error(error.message); else toast.success(t("resetSent"));
    }
    setBusy(false);
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-glow">
        <Logo className="mx-auto h-9" />
        <label className="block space-y-1 text-sm">{t("email")}<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" /></label>
        {mode !== "forgot" && <label className="block space-y-1 text-sm">{t("password")}<Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete={mode === "setup" ? "new-password" : "current-password"} minLength={mode === "setup" ? 8 : undefined} /></label>}
        <Button variant="hero" className="w-full" disabled={busy}>{mode === "in" ? t("signIn") : mode === "setup" ? t("createAdmin") : t("sendReset")}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "forgot" : "in")} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">{mode === "in" ? t("forgot") : t("backToSignIn")}</button>
        {mode === "in" && <button type="button" onClick={() => setMode("setup")} className="block w-full text-center text-sm text-primary hover:underline">{t("firstSetup")}</button>}
        <div className="flex justify-center"><LanguageSwitcher /></div>
      </form>
    </div>
  );
}
