import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Row, SeriesCard } from "@/components/site/Cards";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { castOf, genresQuery, seriesQuery } from "@/lib/api";
import { genreName, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/series/$slug")({
  loader: async ({ context, params }) => {
    const [d] = await Promise.all([
      context.queryClient.ensureQueryData(seriesQuery(params.slug)),
      context.queryClient.ensureQueryData(genresQuery),
    ]);
    if (!d) throw notFound();
    return { title: d.series.title, synopsis: d.series.synopsis, image: d.series.cover_url ?? d.series.poster_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متوفر — درموش تي في" }, { name: "robots", content: "noindex" }] };
    const desc = loaderData.synopsis.slice(0, 160);
    const meta = [
      { title: `${loaderData.title} — درموش تي في` },
      { name: "description", content: desc },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "video.tv_show" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData.image?.startsWith("https://")) meta.push({ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image });
    return { meta };
  },
  component: SeriesPage,
});

function SeriesPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(seriesQuery(slug));
  const { data: genres } = useSuspenseQuery(genresQuery);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  if (!data) return null;
  const { series: s, seasons, episodes, related } = data;
  const seasonsWithEps = seasons.filter((se) => episodes.some((e) => e.season_id === se.id));
  const active = seasonId ?? seasonsWithEps[0]?.id;
  const eps = episodes.filter((e) => e.season_id === active);
  const sGenres = s.series_genres.map((x) => genres.find((g) => g.id === x.genre_id)).filter((g) => !!g);
  const cast = castOf(s);
  const first = seasonsWithEps.length ? episodes.filter((e) => e.season_id === seasonsWithEps[0].id)[0] : undefined;

  return (
    <div>
      <section className="relative min-h-[70vh] overflow-hidden">
        {s.cover_url && <img src={s.cover_url} alt="" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-fade-bottom" />
        <div className="absolute inset-0 bg-fade-side" />
        <div className="relative mx-auto flex max-w-[1600px] flex-col gap-8 px-4 pt-28 pb-10 md:flex-row md:items-end md:px-8 md:pt-40">
          {s.poster_url && <img src={s.poster_url} alt={s.title} className="w-40 shrink-0 rounded-xl shadow-glow ring-1 ring-border md:w-60" />}
          <div className="max-w-3xl animate-rise space-y-4">
            <h1 className="text-3xl font-bold md:text-5xl">{s.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              {sGenres.map((g) => <span key={g.id} className="rounded-full bg-secondary px-3 py-1">{genreName(g, lang)}</span>)}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              {s.release_year && <div><dt className="text-muted-foreground">{t("year")}</dt><dd>{s.release_year}</dd></div>}
              <div><dt className="text-muted-foreground">{t("status")}</dt><dd>{t(`status_${s.production_status}`)}</dd></div>
              <div><dt className="text-muted-foreground">{t("seasons")}</dt><dd>{seasonsWithEps.length}</dd></div>
              <div><dt className="text-muted-foreground">{t("episodes")}</dt><dd>{episodes.length}</dd></div>
              {s.production && <div className="col-span-2"><dt className="text-muted-foreground">{t("production")}</dt><dd>{s.production}</dd></div>}
            </dl>
            <p className="leading-relaxed text-foreground/85">{s.synopsis}</p>
            {first && <Button asChild variant="hero" size="lg"><Link to="/watch/$episodeId" params={{ episodeId: first.id }}><Play className="fill-current" /> {t("watchNow")}</Link></Button>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] space-y-12 px-4 md:px-8">
        <section id="episodes" className="space-y-4 scroll-mt-24">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{t("episodes")}</h2>
            <div className="flex flex-wrap gap-2">
              {seasonsWithEps.map((se) => (
                <button key={se.id} onClick={() => setSeasonId(se.id)} className={`rounded-full px-4 py-1.5 text-sm transition ${se.id === active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {se.title || `${t("season")} ${se.season_number}`}
                </button>
              ))}
            </div>
          </div>
          {eps.length === 0 ? <p className="text-muted-foreground">{t("noEpisodes")}</p> : (
            <ol className="grid gap-3 md:grid-cols-2">
              {eps.map((e) => (
                <li key={e.id}>
                  <Link to="/watch/$episodeId" params={{ episodeId: e.id }} className="group flex gap-4 rounded-xl border border-border bg-card p-3 transition hover:border-primary">
                    <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-surface sm:w-44">
                      {e.thumbnail_url && <img src={e.thumbnail_url} alt="" loading="lazy" className="size-full object-cover" />}
                      <Play className="absolute inset-0 m-auto size-8 rounded-full bg-gradient-primary p-2 opacity-0 transition group-hover:opacity-100" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-medium">{e.episode_number}. {e.title}</h3>
                      {e.duration_minutes ? <p className="text-xs text-muted-foreground">{e.duration_minutes} {t("min")}</p> : null}
                      <p className="line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {s.trailer_url && (
          <section className="max-w-4xl space-y-4">
            <h2 className="text-xl font-semibold">{t("trailer")}</h2>
            <VideoPlayer url={s.trailer_url} title={`${s.title} trailer`} poster={s.cover_url} />
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("cast")}</h2>
            <ul className="flex flex-wrap gap-3">
              {cast.map((c, i) => (
                <li key={i} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <p className="font-medium">{c.name}</p>
                  {c.character && <p className="text-muted-foreground">{c.character}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {related.length > 0 && <div className="mt-12"><Row title={t("related")}>{related.map((r) => <SeriesCard key={r.id} s={r} genres={genres} />)}</Row></div>}
    </div>
  );
}
