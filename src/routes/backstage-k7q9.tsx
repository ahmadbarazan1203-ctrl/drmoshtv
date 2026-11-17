import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/admin/AdminApp";
import { translate } from "@/lib/i18n";

// Private admin URL (also set in src/lib/admin-path.ts). Access is enforced by the admin role
// in the database (RLS + has_role), not by this URL being hidden.
export const Route = createFileRoute("/backstage-k7q9")({
  ssr: false,
  head: () => ({ meta: [
    { title: `${translate("ar", "adm_title")} — ${translate("ar", "brand")}` },
    { name: "description", content: translate("ar", "adm_title") },
    { property: "og:title", content: `${translate("ar", "adm_title")} — ${translate("ar", "brand")}` },
    { property: "og:description", content: translate("ar", "adm_title") },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow, noarchive" },
  ] }),
  component: AdminApp,
});
