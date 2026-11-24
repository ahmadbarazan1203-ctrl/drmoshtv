import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";
import { Button } from "@/components/ui/button";
import { EpisodeCard, EpisodeRow } from "@/components/site/Cards";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { supabase } from "@/lib/db";
import { episodeQuery, episodeThumbnail, parseServers } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { episodeSwipe } from "@/lib/playback";

export const Route = createFileRoute("/watch/$episodeId")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(episodeQuery(params.episodeId));
    if (!d || !d.series) throw notFound();
    return { title: d.episode.title, series: d.series.title, desc: d.episode.description, image: episodeThumbnail(d.episode, d.series) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متوفر — TAIB AI TV+" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.series}: ${loaderData.title} — TAIB AI TV+`;
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
  const { t, dir } = useI18n();
  const { data } = useSuspenseQuery(episodeQuery(episodeId));
  const onFirstPlay = useCallback(() => { supabase.rpc("record_view", { _episode_id: episodeId }); }, [episodeId]);
  if (!data || !data.series) return null;
  const { episode: e, series: s, prev, next, all, seasonNum } = data;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 pt-24 md:px-8">
      <EpisodePlayerGesture raw={e.video_url} poster={episodeThumbnail(e, s)} title={e.title} onFirstPlay={onFirstPlay} previousId={prev?.id ?? null} nextId={next?.id ?? null} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Link to="/series/$slug" params={{ slug: s.slug }} className="text-sm text-primary-glow hover:underline">{s.title}</Link>
          <h1 className="text-2xl font-bold md:text-3xl">{t("season")} {data.seasonNumber} · {t("episode")} {e.episode_number}: {e.title}</h1>
          {e.duration_minutes ? <p className="text-sm text-muted-foreground">{e.duration_minutes} {t("min")}</p> : null}
          <p className="max-w-3xl text-foreground/85">{e.description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild={!!prev} variant="secondary" disabled={!prev} className="rounded-full">
            {prev ? <Link to="/watch/$episodeId" params={{ episodeId: prev.id }}><PrevIcon /> {t("prev")}</Link> : <span><PrevIcon /> {t("prev")}</span>}
          </Button>
          <Button asChild={!!next} variant="hero" disabled={!next}>
            {next ? <Link to="/watch/$episodeId" params={{ episodeId: next.id }}>{t("next")} <NextIcon /></Link> : <span>{t("next")} <NextIcon /></span>}
          </Button>
        </div>
      </div>
      {all.length > 1 && (
        <div className="-mx-4 md:-mx-8">
          <EpisodeRow title={t("relatedEpisodes")}>
            {all.filter((x) => x.id !== e.id).map((x) => <EpisodeCard key={x.id} e={x} seasonNumber={seasonNum[x.season_id]} seriesPoster={s.poster_url} />)}
          </EpisodeRow>
        </div>
      )}
    </div>
  );
}

function EpisodePlayerGesture({ raw, poster, title, onFirstPlay, previousId, nextId }: { raw: string | null; poster: string | null; title: string; onFirstPlay: () => void; previousId: string | null; nextId: string | null }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const lastWheel = useRef(0);
  const go = useCallback((direction: "next" | "prev") => {
    const id = direction === "next" ? nextId : previousId;
    if (id) void nav({ to: "/watch/$episodeId", params: { episodeId: id } });
  }, [nav, nextId, previousId]);
  const isControl = (target: EventTarget | null) => target instanceof Element && !!target.closest("button, input, select, a");

  return (
    <div
      role="group"
      aria-label={t("swipeEpisodes")}
      className="relative space-y-2 touch-pan-x"
      onTouchStart={(event: TouchEvent<HTMLDivElement>) => {
        if (isControl(event.target)) return;
        const point = event.touches[0];
        if (point) touch.current = { x: point.clientX, y: point.clientY };
      }}
      onTouchEnd={(event: TouchEvent<HTMLDivElement>) => {
        const start = touch.current;
        touch.current = null;
        const end = event.changedTouches[0];
        if (!start || !end || isControl(event.target)) return;
        const direction = episodeSwipe(start.y, end.clientY, start.x, end.clientX);
        if (direction) go(direction);
      }}
      onTouchCancel={() => { touch.current = null; }}
      onWheel={(event: WheelEvent<HTMLDivElement>) => {
        const now = Date.now();
        if (Math.abs(event.deltaY) < 60 || now - lastWheel.current < 900 || isControl(event.target)) return;
        lastWheel.current = now;
        go(event.deltaY > 0 ? "next" : "prev");
      }}
    >
      <ServerPicker raw={raw} poster={poster} title={title} onFirstPlay={onFirstPlay} onEnded={() => go("next")} />
      <div data-testid="episode-swipe-area" aria-hidden="true" className="absolute inset-x-0 top-0 z-10 mx-auto h-2/5 max-w-sm touch-none" />
      <p className="mx-auto max-w-sm text-center text-xs text-muted-foreground">{t("autoplayMuted")} {t("swipeEpisodes")}</p>
    </div>
  );
}

function ServerPicker({ raw, poster, title, onFirstPlay, onEnded }: { raw: string | null; poster: string | null; title: string; onFirstPlay: () => void; onEnded: () => void }) {
  const { t } = useI18n();
  const servers = parseServers(raw);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [raw]);
  const cur = servers[i] ?? servers[0];
  return (
    <div className="space-y-3">
      <VideoPlayer url={cur?.url ?? null} poster={poster} title={title} onFirstPlay={onFirstPlay} onEnded={onEnded} vertical autoPlay />
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
