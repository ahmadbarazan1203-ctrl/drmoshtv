import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { Episode, Genre, SeriesWithGenres } from "@/lib/api";
import { episodeThumbnail } from "@/lib/api";
import { genreName, useI18n } from "@/lib/i18n";

export function SeriesCard({ s, genres }: { s: SeriesWithGenres; genres: Genre[] }) {
  const { t, lang } = useI18n();
  const g = genres.find((x) => x.id === s.series_genres[0]?.genre_id);
  const status = s.production_status === "upcoming" ? t("status_upcoming") : t("available");
  return (
    <Link to="/series/$slug" params={{ slug: s.slug }} className="group block w-full min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-border/50 transition duration-300 group-hover:-translate-y-1 group-hover:ring-primary group-hover:shadow-glow">
        {s.poster_url ? (
          <img referrerPolicy="no-referrer" src={s.poster_url} alt={s.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-primary/20 p-3 text-center text-sm font-medium">{s.title}</div>
        )}
        <span className={`absolute top-2 start-2 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur ${s.production_status === "upcoming" ? "bg-background/70 text-muted-foreground" : "bg-primary/85 text-primary-foreground"}`}>{status}</span>
        {s.is_original && <span className="absolute top-2 end-2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-primary-glow backdrop-blur">{t("original")}</span>}
      </div>
      <div className="mt-2 space-y-0.5 px-0.5">
        <h3 className="truncate text-sm font-medium">{s.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{[s.release_year, g && genreName(g, lang)].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}

export function EpisodeCard({ e, seriesTitle, seasonNumber, seriesPoster }: { e: Episode; seriesTitle?: string | undefined; seasonNumber?: number | undefined; seriesPoster?: string | null | undefined }) {
  const { t } = useI18n();
  const thumbnail = episodeThumbnail(e, seriesPoster);
  return (
    <Link to="/watch/$episodeId" params={{ episodeId: e.id }} className="group block w-64 shrink-0 sm:w-72">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-surface ring-1 ring-border/50 transition group-hover:ring-primary">
        {thumbnail ? <img referrerPolicy="no-referrer" src={thumbnail} alt={e.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="size-full bg-gradient-primary opacity-30" />}
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full bg-gradient-primary p-3 shadow-glow"><Play className="size-5 fill-current" /></span>
        </div>
        {e.duration_minutes ? <span className="absolute bottom-2 end-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px]">{e.duration_minutes} {t("min")}</span> : null}
      </div>
      <div className="mt-2 px-0.5">
        {seriesTitle && <p className="truncate text-xs text-primary-glow">{seriesTitle}</p>}
        <h3 className="truncate text-sm font-medium">{seasonNumber ? `${t("season")} ${seasonNumber} · ` : ""}{t("episode")} {e.episode_number}: {e.title}</h3>
      </div>
    </Link>
  );
}

export function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise space-y-3">
      <h2 className="px-4 text-lg font-semibold md:px-8 md:text-xl">{title}</h2>
      <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-3 md:gap-4 md:px-8">{children}</div>
    </section>
  );
}

export function SeriesRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise mx-auto max-w-[1600px] space-y-4">
      <h2 className="px-4 text-lg font-semibold md:px-8 md:text-xl">{title}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 px-4 sm:grid-cols-3 md:grid-cols-4 md:gap-x-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">{children}</div>
    </section>
  );
}
