export function autoplayEmbed(url: string) {
  const embed = new URL(url);
  embed.searchParams.set("autoplay", "1");
  if (embed.hostname.endsWith("youtube-nocookie.com") || embed.hostname.endsWith("youtube.com")) {
    embed.searchParams.set("mute", "1");
    embed.searchParams.set("enablejsapi", "1");
  } else {
    embed.searchParams.set("muted", "1");
  }
  return embed.href;
}

export function playerEnded(value: unknown): boolean {
  let data = value;
  if (typeof data === "string") {
    if (data === "ended") return true;
    try { data = JSON.parse(data); } catch { return false; }
  }
  if (!data || typeof data !== "object") return false;
  const message = data as Record<string, unknown>;
  const event = message["event"] ?? message["type"] ?? message["action"];
  if (event === "onStateChange" && message["info"] === 0) return true;
  if (event === "infoDelivery" && typeof message["info"] === "object" && message["info"] !== null) {
    return (message["info"] as Record<string, unknown>)["playerState"] === 0;
  }
  return event === "ended" || event === "onEnded" || event === "finished" || event === "videoEnded" || event === "complete";
}

export type EpisodeOrderItem = { id: string; season_id: string; episode_number: number };

export function orderEpisodes<T extends EpisodeOrderItem>(episodes: T[], seasons: { id: string; season_number: number }[]): T[] {
  const seasonNum = new Map(seasons.map((season) => [season.id, season.season_number]));
  return [...episodes].sort(
    (a, b) => (seasonNum.get(a.season_id) ?? 0) - (seasonNum.get(b.season_id) ?? 0) || a.episode_number - b.episode_number,
  );
}

export function episodeNeighbors<T extends { id: string }>(ordered: T[], currentId: string): { prev: T | null; next: T | null } {
  const index = ordered.findIndex((episode) => episode.id === currentId);
  return {
    prev: index > 0 ? ordered[index - 1] ?? null : null,
    next: index >= 0 ? ordered[index + 1] ?? null : null,
  };
}

export type EpisodeSwipe = "next" | "prev" | null;

export function episodeSwipe(startY: number, endY: number, startX = 0, endX = 0): EpisodeSwipe {
  const vertical = startY - endY;
  const horizontal = Math.abs(startX - endX);
  if (Math.abs(vertical) < 64 || horizontal > Math.abs(vertical)) return null;
  return vertical > 0 ? "next" : "prev";
}
