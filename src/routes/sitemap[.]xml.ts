import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
        });
        const origin = new URL(request.url).origin;
        const [{ data: series }, { data: eps }] = await Promise.all([
          sb.from("series").select("slug, updated_at").eq("is_published", true),
          sb.from("episodes").select("id, updated_at").eq("is_published", true).lte("publish_at", new Date().toISOString()),
        ]);
        const urls = [
          { loc: `${origin}/`, lastmod: undefined as string | undefined },
          { loc: `${origin}/search`, lastmod: undefined },
          ...(series ?? []).map((s) => ({ loc: `${origin}/series/${encodeURIComponent(s.slug)}`, lastmod: s.updated_at })),
          ...(eps ?? []).map((e) => ({ loc: `${origin}/watch/${e.id}`, lastmod: e.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`).join("")}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" } });
      },
    },
  },
});
