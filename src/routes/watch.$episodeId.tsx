import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EpisodeCard, Row } from "@/components/site/Cards";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { episodeQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/watch/$episodeId")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(episodeQuery(params.episodeId));
    if (!d || !d.series) throw notFound();
    return { title: d.episode.title, series: d.series.title, desc: d.episode.description, image: d.episode.thumbnail_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متوفر — درموش تي في" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.series}: ${loaderData.title} — درموش تي في`;
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
  const nav = useNavigate();
  const { data } = useSuspenseQuery(episodeQuery(episodeId));
  const onFirstPlay = useCallback(() => { supabase.rpc("record_view", { _episode_id: episodeId }); }, [episodeId]);
  if (!data || !data.series) return null;
  const { episode: e, series: s, prev, next, all, seasonNum } = data;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 pt-24 md:px-8">
      <VideoPlayer
        url={e.video_url}
        poster={e.thumbnail_url}
        title={e.title}
        onFirstPlay={onFirstPlay}
        onEnded={() => next && nav({ to: "/watch/$episodeId", params: { episodeId: next.id } })}
      />
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
          <Row title={t("relatedEpisodes")}>
            {all.filter((x) => x.id !== e.id).map((x) => <EpisodeCard key={x.id} e={x} seasonNumber={seasonNum[x.season_id]} />)}
          </Row>
        </div>
      )}
    </div>
  );
}
