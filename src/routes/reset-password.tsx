import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/lib/db";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Reset,
});

function Reset() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) return toast.error("8+");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success(t("passwordUpdated"));
          nav({ to: "/backstage-k7q9" });
          return undefined;
        }}
      >
        <Logo className="mx-auto h-8" />
        <label className="block space-y-1 text-sm">{t("newPassword")}<Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required autoComplete="new-password" /></label>
        <Button variant="hero" className="w-full" disabled={busy}>{t("updatePassword")}</Button>
      </form>
    </div>
  );
}
