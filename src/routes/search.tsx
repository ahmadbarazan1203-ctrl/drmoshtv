import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { EpisodeCard, SeriesCard } from "@/components/site/Cards";
import { supabase } from "@/lib/db";
import { genresQuery, homeQuery } from "@/lib/api";
import { genreName, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s["q"] === "string" ? s["q"].slice(0, 100) : "",
    genre: typeof s["genre"] === "string" ? s["genre"] : "",
    sort: typeof s["sort"] === "string" ? s["sort"] : "newest",
  }),
  head: () => ({
    meta: [
      { title: "البحث والتصفح — درموش تي في" },
      { name: "description", content: "ابحث في مسلسلات وحلقات درموش تي في حسب الاسم أو التصنيف أو الكلمات المفتاحية." },
      { property: "og:title", content: "البحث — درموش تي في" },
      { property: "og:description", content: "اكتشف مسلسلات الذكاء الاصطناعي على درموش تي في." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(homeQuery), context.queryClient.ensureQueryData(genresQuery)]);
  },
  component: SearchPage,
});

function SearchPage() {
  const { q, genre, sort } = Route.useSearch();
  const nav = Route.useNavigate();
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(homeQuery);
  const { data: genres } = useSuspenseQuery(genresQuery);
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  useEffect(() => {
    const id = setTimeout(() => { if (text !== q) nav({ to: ".", search: (p) => ({ ...p, q: text.slice(0, 100) }), replace: true }); }, 300);
    return () => clearTimeout(id);
  }, [text, q, nav]);

  const needle = q.trim().toLowerCase();
  const g = genres.find((x) => x.slug === genre);
  const matchGenreText = (sid: string[]) =>
    genres.filter((x) => sid.includes(x.id)).some((x) => [x.name_ar, x.name_en, x.name_fr, x.name_tr].some((n) => n.toLowerCase().includes(needle)));
  let series = data.series.filter((s) => {
    if (g && !s.series_genres.some((x) => x.genre_id === g.id)) return false;
    if (!needle) return true;
    return [s.title, s.synopsis, s.keywords ?? "", s.production ?? ""].some((v) => v.toLowerCase().includes(needle)) || matchGenreText(s.series_genres.map((x) => x.genre_id));
  });
  series = [...series].sort((a, b) =>
    sort === "popular" ? b.views - a.views : sort === "title" ? a.title.localeCompare(b.title) : sort === "year" ? (b.release_year ?? 0) - (a.release_year ?? 0) : b.created_at.localeCompare(a.created_at),
  );

  const { data: eps } = useQuery({
    queryKey: ["search-episodes", needle],
    enabled: needle.length >= 2,
    queryFn: async () => {
      const safe = needle.replace(/[%_,()]/g, " ");
      const { data } = await supabase.from("episodes").select("*, series:series_id(title)").eq("is_published", true).lte("publish_at", new Date().toISOString()).ilike("title", `%${safe}%`).limit(20);
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-4 pt-24 md:px-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t("search")}</h1>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={100} placeholder={t("searchPlaceholder")} aria-label={t("search")} className="h-12 w-full rounded-full border border-border bg-surface px-5 outline-none focus:border-primary" />
      <div className="flex flex-wrap items-center gap-2">
        <Link to="." search={(p) => ({ ...p, genre: "" })} className={`rounded-full px-3 py-1.5 text-sm ${!g ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t("allGenres")}</Link>
        {genres.map((x) => (
          <Link key={x.id} to="." search={(p) => ({ ...p, genre: x.slug })} className={`rounded-full px-3 py-1.5 text-sm ${g?.id === x.id ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{genreName(x, lang)}</Link>
        ))}
        <label className="ms-auto flex items-center gap-2 text-sm text-muted-foreground">
          {t("sort")}
          <select value={sort} onChange={(e) => nav({ to: ".", search: (p) => ({ ...p, sort: e.target.value }) })} className="rounded-full border border-border bg-surface px-3 py-1.5 text-foreground">
            <option value="newest">{t("sortNewest")}</option>
            <option value="popular">{t("sortPopular")}</option>
            <option value="title">{t("sortTitle")}</option>
            <option value="year">{t("sortYear")}</option>
          </select>
        </label>
      </div>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("results")} ({series.length})</h2>
        {series.length === 0 ? <p className="text-muted-foreground">{data.series.length ? t("noResults") : t("emptyCatalog")}</p> : (
          <div className="flex flex-wrap gap-4">{series.map((s) => <SeriesCard key={s.id} s={s} genres={genres} />)}</div>
        )}
      </section>
      {eps && eps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("episodes")}</h2>
          <div className="flex flex-wrap gap-4">{eps.map((e) => <EpisodeCard key={e.id} e={e} seriesTitle={(e.series as { title: string } | null)?.title} />)}</div>
        </section>
      )}
    </div>
  );
}
