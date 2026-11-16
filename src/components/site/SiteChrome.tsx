import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { announcementsQuery } from "@/lib/api";
import { ADMIN_PATH } from "@/lib/admin-path";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteChrome({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { data: ann } = useQuery(announcementsQuery);
  if (pathname.startsWith(ADMIN_PATH) || pathname === "/reset-password") return <>{children}</>;
  const a = ann?.[0];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {a && (
        <div className="fixed inset-x-0 top-16 z-30 bg-gradient-primary px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
          {a.link_url?.startsWith("https://") ? <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{a.message}</a> : a.message}
        </div>
      )}
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
