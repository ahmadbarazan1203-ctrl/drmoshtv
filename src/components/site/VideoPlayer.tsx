import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseVideo } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { autoplayEmbed } from "@/lib/playback";

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60), x = Math.floor(s % 60);
  return `${m}:${x.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ url, poster, title, onFirstPlay, vertical = false, autoPlay = false }: { url: string | null; poster?: string | null; title: string; onFirstPlay?: () => void; vertical?: boolean; autoPlay?: boolean }) {
  const { t } = useI18n();
  const src = parseVideo(url);
  const frameClass = vertical ? "mx-auto aspect-[9/16] w-full max-w-sm rounded-2xl" : "aspect-video w-full rounded-xl";
  const wrap = useRef<HTMLDivElement>(null);
  const v = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(autoPlay);
  const [fs, setFs] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  useEffect(() => { started.current = false; setPlaying(false); setTime(0); setMuted(autoPlay); }, [url, autoPlay]);
  useEffect(() => {
    if (src && src.kind !== "file" && !started.current) { started.current = true; onFirstPlay?.(); }
  }, [src, onFirstPlay]);

  if (!src) {
    return <div className={`${frameClass} flex items-center justify-center bg-surface text-muted-foreground`}>{t("noVideo")}</div>;
  }
  if (src.kind !== "file") {
    return (
      <div className={`${frameClass} overflow-hidden bg-black/0 ring-1 ring-border`}>
        <iframe src={autoPlay ? autoplayEmbed(src.embed) : src.embed} title={title} className="size-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    );
  }

  const toggle = () => { const el = v.current; if (!el) return; el.paused ? el.play() : el.pause(); };
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else wrap.current?.requestFullscreen(); };

  return (
    <div ref={wrap} className={`${frameClass} group relative overflow-hidden bg-background ring-1 ring-border`} dir="ltr">
      <video
        ref={v}
        src={src.src}
        poster={poster ?? undefined}
        className="size-full"
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        onCanPlay={(event) => { if (autoPlay && event.currentTarget.paused) void event.currentTarget.play().catch(() => {}); }}
        onClick={toggle}
        onPlay={() => { setPlaying(true); if (!started.current) { started.current = true; onFirstPlay?.(); } }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />
      {!playing && (
        <button onClick={toggle} aria-label="Play" className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
          <Play className="size-7 fill-current" />
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-background/95 to-transparent p-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <input type="range" min={0} max={dur || 0} step={0.1} value={time} onChange={(e) => { if (v.current) v.current.currentTime = +e.target.value; }} aria-label="Progress" className="w-full accent-primary" />
        <div className="flex items-center gap-3 text-sm">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-5" /> : <Play className="size-5" />}</button>
          <button onClick={() => { if (v.current) { v.current.muted = !muted; setMuted(!muted); } }} aria-label="Mute">{muted || vol === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}</button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : vol} onChange={(e) => { const x = +e.target.value; setVol(x); if (v.current) { v.current.volume = x; v.current.muted = x === 0; setMuted(x === 0); } }} aria-label="Volume" className="w-20 accent-primary" />
          <span className="tabular-nums text-muted-foreground">{fmt(time)} / {fmt(dur)}</span>
          <select value={rate} onChange={(e) => { const r = +e.target.value; setRate(r); if (v.current) v.current.playbackRate = r; }} aria-label="Speed" className="ms-auto rounded bg-secondary px-1.5 py-0.5 text-xs">
            {[0.5, 1, 1.25, 1.5, 2].map((r) => <option key={r} value={r}>{r}x</option>)}
          </select>
          <button onClick={toggleFs} aria-label="Fullscreen">{fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}</button>
        </div>
      </div>
    </div>
  );
}
