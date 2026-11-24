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
  return event === "ended" || event === "onEnded" || event === "finished";
}

export type EpisodeSwipe = "next" | "prev" | null;

export function episodeSwipe(startY: number, endY: number, startX = 0, endX = 0): EpisodeSwipe {
  const vertical = startY - endY;
  const horizontal = Math.abs(startX - endX);
  if (Math.abs(vertical) < 64 || horizontal > Math.abs(vertical)) return null;
  return vertical > 0 ? "next" : "prev";
}
