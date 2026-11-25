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

export function firstEpisode<T extends EpisodeOrderItem>(episodes: T[], seasons: { id: string; season_number: number }[]): T | null {
  return orderEpisodes(episodes, seasons)[0] ?? null;
}
