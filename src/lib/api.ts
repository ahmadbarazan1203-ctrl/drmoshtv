import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

export type Series = Database["public"]["Tables"]["series"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];
export type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type Genre = Database["public"]["Tables"]["genres"]["Row"];
export type Settings = Database["public"]["Tables"]["platform_settings"]["Row"];
export type SeriesWithGenres = Series & { series_genres: { genre_id: string }[] };
export type CastMember = { name: string; character?: string };

const SERIES_SEL = "*, series_genres(genre_id)";

export const genresQuery = queryOptions({
  queryKey: ["genres"],
  queryFn: async () => {
    const { data, error } = await supabase.from("genres").select("*").order("name_en");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const [s, c] = await Promise.all([
      supabase.from("platform_settings").select("id, site_name, site_description, seo_title, seo_description, og_image, social_links, section_order, updated_at").eq("id", 1).maybeSingle(),
      supabase.rpc("public_contact"),
    ]);
    if (s.error) throw s.error;
    if (!s.data) return null;
    const contact = c.data?.[0];
    return { ...s.data, contact_email: contact?.contact_email ?? null, contact_phone: contact?.contact_phone ?? null };
  },
  staleTime: 30_000,
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements", "active"],
  queryFn: async () => {
    const { data, error } = await supabase.from("announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1);
    if (error) throw error;
    return data;
  },
});

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [series, episodes, featured] = await Promise.all([
      supabase.from("series").select(SERIES_SEL).eq("is_published", true).order("created_at", { ascending: false }).limit(200),
      supabase.from("episodes").select("*, series:series_id(title, slug)").eq("is_published", true).lte("publish_at", new Date().toISOString()).order("publish_at", { ascending: false }).limit(16),
      supabase.from("featured_content").select("series_id").eq("slot", "hero").order("position").limit(1),
    ]);
    if (series.error) throw series.error;
    if (episodes.error) throw episodes.error;
    return {
      series: (series.data ?? []) as SeriesWithGenres[],
      episodes: episodes.data ?? [],
      heroId: featured.data?.[0]?.series_id ?? null,
    };
  },
});

export const seriesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["series", slug],
    queryFn: async () => {
      const { data: s, error } = await supabase.from("series").select(SERIES_SEL).eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!s) return null;
      const [seasons, episodes, related] = await Promise.all([
        supabase.from("seasons").select("*").eq("series_id", s.id).order("season_number"),
        supabase.from("episodes").select("*").eq("series_id", s.id).eq("is_published", true).lte("publish_at", new Date().toISOString()).order("episode_number"),
        supabase.from("series").select(SERIES_SEL).eq("is_published", true).neq("id", s.id).order("views", { ascending: false }).limit(30),
      ]);
      const gids = new Set((s as SeriesWithGenres).series_genres.map((g) => g.genre_id));
      const rel = ((related.data ?? []) as SeriesWithGenres[])
        .map((r) => ({ r, score: r.series_genres.filter((g) => gids.has(g.genre_id)).length }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map((x) => x.r);
      return { series: s as SeriesWithGenres, seasons: seasons.data ?? [], episodes: episodes.data ?? [], related: rel };
    },
  });

export const episodeQuery = (id: string) =>
  queryOptions({
    queryKey: ["episode", id],
    queryFn: async () => {
      const { data: ep, error } = await supabase.from("episodes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!ep) return null;
      const [series, seasons, all] = await Promise.all([
        supabase.from("series").select("*").eq("id", ep.series_id).maybeSingle(),
        supabase.from("seasons").select("*").eq("series_id", ep.series_id).order("season_number"),
        supabase.from("episodes").select("*").eq("series_id", ep.series_id).eq("is_published", true).lte("publish_at", new Date().toISOString()),
      ]);
      const seasonNum = new Map((seasons.data ?? []).map((s) => [s.id, s.season_number]));
      const ordered = (all.data ?? []).sort(
        (a, b) => (seasonNum.get(a.season_id) ?? 0) - (seasonNum.get(b.season_id) ?? 0) || a.episode_number - b.episode_number,
      );
      const idx = ordered.findIndex((e) => e.id === ep.id);
      return {
        episode: ep,
        series: series.data,
        seasonNumber: seasonNum.get(ep.season_id) ?? 1,
        prev: idx > 0 ? ordered[idx - 1] : null,
        next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
        all: ordered,
        seasonNum: Object.fromEntries(seasonNum),
      };
    },
  });

export function castOf(s: Series): CastMember[] {
  return Array.isArray(s.cast_members) ? (s.cast_members as CastMember[]) : [];
}

export function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export type VideoSource = { kind: "youtube" | "vimeo" | "embed"; embed: string } | { kind: "file"; src: string } | null;

export function parseVideo(url: string | null | undefined): VideoSource {
  if (!url) return null;
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const h = u.hostname.replace(/^www\./, "");
  if (h === "youtube.com" || h === "m.youtube.com" || h === "youtu.be") {
    const id = h === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
    if (id && /^[\w-]{6,20}$/.test(id)) return { kind: "youtube", embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` };
    return null;
  }
  if (h === "vimeo.com" || h === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (id && /^\d+$/.test(id)) return { kind: "vimeo", embed: `https://player.vimeo.com/video/${id}` };
    return null;
  }
  if (/\.(mp4|webm|m4v|mov|ogv|ogg|m3u8)$/i.test(u.pathname)) return { kind: "file", src: u.href };
  // VidHide-style hosts: share links (/v/, /f/, /d/, /file/) become embed links.
  const m = u.pathname.match(/^\/(?:v|f|d|file|e)\/([\w-]+)/);
  if (m) return { kind: "embed", embed: `${u.origin}/embed/${m[1]}` };
  return { kind: "embed", embed: u.href };
}

// Several servers per episode: one per line, optionally "Name | https://...".
export function parseServers(raw: string | null | undefined): { name: string; url: string }[] {
  return (raw ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const k = l.lastIndexOf("|");
    const name = k > 0 ? l.slice(0, k).trim() : "";
    const url = (k > 0 ? l.slice(k + 1) : l).trim();
    return { name: name || `${i + 1}`, url };
  }).filter((x) => parseVideo(x.url));
}
