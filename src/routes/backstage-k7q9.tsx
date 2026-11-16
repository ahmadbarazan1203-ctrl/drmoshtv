import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/admin/AdminApp";

// Private admin URL (also set in src/lib/admin-path.ts). Access is enforced by the admin role
// in the database (RLS + has_role), not by this URL being hidden.
export const Route = createFileRoute("/backstage-k7q9")({
  ssr: false,
  head: () => ({ meta: [{ title: "Studio" }, { name: "robots", content: "noindex, nofollow, noarchive" }] }),
  component: AdminApp,
});
