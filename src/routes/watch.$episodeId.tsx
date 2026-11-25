import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EpisodeCard, EpisodeRow, SeriesCard, SeriesRow } from "@/components/site/Cards";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { supabase } from "@/lib/db";
import { episodeQuery, episodeThumbnail, genresQuery, parseServers } from "@/lib/api";
import { genreName, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/watch/$episodeId")({
  loader: async ({ context, params }) => {
    const [d] = await Promise.all([
      context.queryClient.ensureQueryData(episodeQuery(params.episodeId)),
      context.queryClient.ensureQueryData(genresQuery),
    ]);
    if (!d || !d.series) throw notFound();
    return { title: d.episode.title, series: d.series.title, desc: d.episode.description || d.series.synopsis, image: episodeThumbnail(d.episode, d.series) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متوفر — TAIB AI TV+" }, { name: "robots", content: "noindex" }] };
    const heading = loaderData.title.trim() && loaderData.title.trim() !== loaderData.series.trim()
      ? `${loaderData.series}: ${loaderData.title}`
      : loaderData.series;
    const title = `${heading} — TAIB AI TV+`;
    const desc = (loaderData.desc || loaderData.series).slice(0, 160);
    const meta = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "video.episode" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData.image?.startsWith("https://")) meta.push({ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image });
    return { meta };
  },
  component: Watch,
});

function Watch() {
  const { episodeId } = Route.useParams();
  const { t, lang, dir } = useI18n();
  const { data } = useSuspenseQuery(episodeQuery(episodeId));
  const { data: genres } = useSuspenseQuery(genresQuery);
  const onFirstPlay = useCallback(() => { supabase.rpc("record_view", { _episode_id: episodeId }); }, [episodeId]);
  if (!data || !data.series) return null;
  const { episode: e, series: s, prev, next, all, seasonNum, related } = data;
  const isSingle = all.length <= 1;
  const sGenres = s.series_genres.map((x) => genres.find((g) => g.id === x.genre_id)).filter((g) => !!g);
  const description = e.description.trim() || s.synopsis;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 pt-24 md:px-8">
      <ServerPicker raw={e.video_url} poster={episodeThumbnail(e, s)} title={isSingle ? s.title : e.title} onFirstPlay={onFirstPlay} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          {!isSingle && (
            <Link to="/series/$slug" params={{ slug: s.slug }} search={{ details: true }} className="text-sm text-primary-glow hover:underline">{s.title}</Link>
          )}
          <h1 className="text-2xl font-bold md:text-3xl">
            {isSingle ? s.title : `${t("season")} ${data.seasonNumber} · ${t("episode")} ${e.episode_number}: ${e.title}`}
          </h1>
          {isSingle && e.title.trim() && e.title.trim() !== s.title.trim() && (
            <p className="text-sm text-muted-foreground">{e.title}</p>
          )}
          {sGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {sGenres.map((g) => <span key={g.id} className="rounded-full bg-secondary px-3 py-1">{genreName(g, lang)}</span>)}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {[s.release_year, e.duration_minutes ? `${e.duration_minutes} ${t("min")}` : null, s.production].filter(Boolean).join(" · ")}
          </p>
          {description && <p className="max-w-3xl leading-relaxed text-foreground/85">{description}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/series/$slug" params={{ slug: s.slug }} search={{ details: true }}><Info /> {t("moreInfo")}</Link>
          </Button>
          {!isSingle && (
            <>
              <Button asChild={!!prev} variant="secondary" disabled={!prev} className="rounded-full">
                {prev ? <Link to="/watch/$episodeId" params={{ episodeId: prev.id }}><PrevIcon /> {t("prev")}</Link> : <><PrevIcon /> {t("prev")}</>}
              </Button>
              <Button asChild={!!next} variant="hero" disabled={!next}>
                {next ? <Link to="/watch/$episodeId" params={{ episodeId: next.id }}>{t("next")} <NextIcon /></Link> : <>{t("next")} <NextIcon /></>}
              </Button>
            </>
          )}
        </div>
      </div>
      {all.length > 1 && (
        <div className="-mx-4 md:-mx-8">
          <EpisodeRow title={t("relatedEpisodes")}>
            {all.filter((x) => x.id !== e.id).map((x) => <EpisodeCard key={x.id} e={x} seasonNumber={seasonNum[x.season_id]} seriesPoster={s.poster_url} />)}
          </EpisodeRow>
        </div>
      )}
      {related.length > 0 && (
        <div className="-mx-4 md:-mx-8">
          <SeriesRow title={t("related")}>
            {related.map((r) => <SeriesCard key={r.id} s={r} genres={genres} />)}
          </SeriesRow>
        </div>
      )}
    </div>
  );
}

function ServerPicker({ raw, poster, title, onFirstPlay }: { raw: string | null; poster: string | null; title: string; onFirstPlay: () => void }) {
  const { t } = useI18n();
  const servers = parseServers(raw);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [raw]);
  const cur = servers[i] ?? servers[0];
  return (
    <div className="space-y-3">
      <VideoPlayer url={cur?.url ?? null} poster={poster} title={title} onFirstPlay={onFirstPlay} vertical autoPlay />
      <p className="mx-auto max-w-sm text-center text-xs text-muted-foreground">{t("autoplayMuted")}</p>
      {servers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("servers")}:</span>
          {servers.map((s, k) => (
            <button key={k} onClick={() => setI(k)} className={`rounded-full px-4 py-1.5 text-sm ring-1 ring-border ${k === i ? "bg-gradient-primary shadow-glow" : "bg-secondary"}`}>{/^\d+$/.test(s.name) ? `${t("server")} ${s.name}` : s.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}
