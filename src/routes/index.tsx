import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Info, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { EpisodeCard, Row, SeriesCard, SeriesRow } from "@/components/site/Cards";
import { genresQuery, homeQuery, settingsQuery, type SeriesWithGenres } from "@/lib/api";
import { genreName, useI18n, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAIB AI TV+ — مسلسلات وإنتاجات الذكاء الاصطناعي" },
      { name: "description", content: "شاهد مسلسلات وقصصاً أصلية وإنتاجات سينمائية مصنوعة بالذكاء الاصطناعي على TAIB AI TV+." },
      { property: "og:title", content: "TAIB AI TV+" },
      { property: "og:description", content: "منصة مسلسلات الذكاء الاصطناعي الأصلية TAIB AI TV+." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(genresQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]);
  },
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(homeQuery);
  const { data: genres } = useSuspenseQuery(genresQuery);
  const { data: settings } = useQuery(settingsQuery);
  const all = data.series;
  const hero = all.find((s) => s.id === data.heroId) ?? all[0];
  const byViews = [...all].sort((a, b) => b.views - a.views);
  const latest = all.filter((s) => s.is_latest);
  const sections: Record<string, { title: TKey; items: SeriesWithGenres[] } | "episodes" | "genres"> = {
    latest: { title: "latest", items: latest.length ? latest : all.slice(0, 15) },
    trending: { title: "trending", items: all.filter((s) => s.is_trending) },
    popular: { title: "popular", items: byViews.filter((s) => s.views > 0).slice(0, 15) },
    recent_episodes: "episodes",
    recommended: { title: "recommended", items: byViews.slice(0, 20).filter((s) => s.id !== hero?.id).slice(5, 20) },
    originals: { title: "originals", items: all.filter((s) => s.is_original) },
    genres: "genres",
  };
  const order = settings?.section_order ?? Object.keys(sections);
  const usedGenres = genres.filter((g) => all.some((s) => s.series_genres.some((x) => x.genre_id === g.id)));

  return (
    <div>
      <section className="relative flex min-h-[78vh] items-end overflow-hidden md:min-h-[88vh]">
        <img referrerPolicy="no-referrer" src={hero?.cover_url ?? heroBg} alt="" width={1920} height={1088} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-fade-bottom" />
        <div className="absolute inset-0 bg-fade-side" />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 md:px-8 md:pb-24">
          {hero ? (
            <div className="max-w-2xl animate-rise space-y-4">
              {hero.is_original && <p className="text-sm font-medium tracking-widest text-primary-glow">{t("originals")}</p>}
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">{hero.title}</h1>
              <p className="text-sm text-muted-foreground">
                {[hero.release_year, ...hero.series_genres.map((x) => genres.find((g) => g.id === x.genre_id)).filter(Boolean).slice(0, 3).map((g) => genreName(g!, lang))].filter(Boolean).join(" · ")}
              </p>
              <p className="line-clamp-3 text-base text-foreground/85 md:text-lg">{hero.synopsis}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="hero" size="lg"><Link to="/series/$slug" params={{ slug: hero.slug }} hash="episodes"><Play className="fill-current" /> {t("watchNow")}</Link></Button>
                <Button asChild variant="glass" size="lg"><Link to="/series/$slug" params={{ slug: hero.slug }}><Info /> {t("moreInfo")}</Link></Button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl animate-rise space-y-4">
              <h1 className="text-5xl font-bold md:text-7xl"><span className="text-gradient">{t("brand")}</span></h1>
              <p className="text-lg text-foreground/85">{t("tagline")}</p>
              <p className="text-muted-foreground">{t("emptyCatalog")}</p>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-10 -mt-8 space-y-10">
        {order.map((key) => {
          const sec = sections[key];
          if (!sec) return null;
          if (sec === "episodes") {
            if (!data.episodes.length) return null;
            return (
              <Row key={key} title={t("recent_episodes")}>
                {data.episodes.map((e) => { const parent = e.series as { title: string; poster_url: string | null } | null; return <EpisodeCard key={e.id} e={e} seriesTitle={parent?.title} seriesPoster={parent?.poster_url} />; })}
              </Row>
            );
          }
          if (sec === "genres") {
            if (!usedGenres.length) return null;
            return (
              <section key={key} className="space-y-3 px-4 md:px-8">
                <h2 className="text-lg font-semibold md:text-xl">{t("genres")}</h2>
                <div className="flex flex-wrap gap-2">
                  {usedGenres.map((g) => (
                    <Link key={g.id} to="/search" search={{ q: "", genre: g.slug, sort: "newest" }} className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition hover:border-primary hover:bg-accent">{genreName(g, lang)}</Link>
                  ))}
                </div>
              </section>
            );
          }
          if (!sec.items.length) return null;
          return (
            <SeriesRow key={key} title={t(sec.title)}>
              {sec.items.map((s) => <SeriesCard key={s.id} s={s} genres={genres} />)}
            </SeriesRow>
          );
        })}
      </div>
    </div>
  );
}
