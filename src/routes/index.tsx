import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Info, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { SeriesCard, SeriesRow } from "@/components/site/Cards";
import { genresQuery, homeQuery } from "@/lib/api";
import { seriesForGenre, seriesForGroup, splitSeriesByAdded, type HomeSection } from "@/lib/home-sections";
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
    ]);
  },
  component: Home,
});

const NAV_ITEMS: { id: HomeSection; label: TKey }[] = [
  { id: "all", label: "allSeries" },
  { id: "arabic", label: "arabicSeries" },
  { id: "foreign", label: "foreignSeries" },
  { id: "genres", label: "genres" },
  { id: "special", label: "specialCollection" },
];

function Home() {
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(homeQuery);
  const { data: genres } = useSuspenseQuery(genresQuery);
  const [section, setSection] = useState<HomeSection>("all");
  const [genreId, setGenreId] = useState("");
  const all = data.series;
  const hero = all.find((item) => item.id === data.heroId) ?? all[0];
  const { recent, older } = splitSeriesByAdded(all);
  const selectedGenre = genres.find((genre) => genre.id === genreId);
  const visibleSeries = section === "genres"
    ? genreId ? seriesForGenre(all, genreId) : []
    : section === "all" ? [] : seriesForGroup(all, genres, section);
  const visibleTitle = section === "genres"
    ? selectedGenre ? genreName(selectedGenre, lang) : t("genres")
    : section === "all" ? "" : t(NAV_ITEMS.find((item) => item.id === section)?.label ?? "allSeries");

  const selectSection = (next: HomeSection) => {
    setSection(next);
    if (next !== "genres") setGenreId("");
  };

  return (
    <div>
      {section === "all" && (
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
                  {[hero.release_year, ...hero.series_genres.map((item) => genres.find((genre) => genre.id === item.genre_id)).filter(Boolean).slice(0, 3).map((genre) => genreName(genre!, lang))].filter(Boolean).join(" · ")}
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
      )}

      <div className={section === "all" ? "relative z-10 -mt-8" : "pt-24"}>
        <nav aria-label={t("browse")} className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={section === item.id}
                onClick={() => selectSection(item.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${section === item.id ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground"}`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        </nav>

        {section === "all" ? (
          <div className="mt-8 space-y-10">
            {recent.length > 0 && (
              <SeriesRow title={t("recentlyAdded")}>
                {recent.map((item) => <SeriesCard key={item.id} s={item} genres={genres} />)}
              </SeriesRow>
            )}
            {older.length > 0 && (
              <SeriesRow title={t("olderSeries")}>
                {older.map((item) => <SeriesCard key={item.id} s={item} genres={genres} />)}
              </SeriesRow>
            )}
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-[1600px] space-y-6">
            {section === "genres" && (
              <div className="flex flex-wrap gap-2 px-4 md:px-8">
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre.id}
                    aria-pressed={genreId === genre.id}
                    onClick={() => setGenreId(genre.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${genreId === genre.id ? "border-primary bg-gradient-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground"}`}
                  >
                    {genreName(genre, lang)}
                  </button>
                ))}
              </div>
            )}
            <section className="space-y-4">
              <h2 className="px-4 text-lg font-semibold md:px-8 md:text-xl">{visibleTitle}</h2>
              {section === "genres" && !genreId ? (
                <p className="px-4 text-muted-foreground md:px-8">{t("chooseGenre")}</p>
              ) : visibleSeries.length === 0 ? (
                <p className="px-4 text-muted-foreground md:px-8">{t("noResults")}</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-7 px-4 sm:grid-cols-3 md:grid-cols-4 md:gap-x-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
                  {visibleSeries.map((item) => <SeriesCard key={item.id} s={item} genres={genres} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
