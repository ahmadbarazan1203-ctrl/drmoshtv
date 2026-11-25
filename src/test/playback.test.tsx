import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { I18nProvider } from "@/lib/i18n";
import { autoplayEmbed, episodeNeighbors, firstEpisode, orderEpisodes } from "@/lib/playback";

describe("Episode playback", () => {
  it("starts direct episode files automatically and muted in a vertical 9:16 frame when vertical is set", () => {
    const { container } = render(<I18nProvider><VideoPlayer url="https://cdn.example.org/episode.mp4" title="Episode" vertical autoPlay /></I18nProvider>);
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("autoplay");
    expect(video?.muted).toBe(true);
    expect(container.firstElementChild?.className).toContain("aspect-[9/16]");
  });

  it("adds autoplay to external players without dropping existing parameters", () => {
    const url = new URL(autoplayEmbed("https://voe.sx/e/kxvjsnzvwuuj?quality=hd"));
    expect(url.searchParams.get("quality")).toBe("hd");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("muted")).toBe("1");
    const youtube = new URL(autoplayEmbed("https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0"));
    expect(youtube.searchParams.get("mute")).toBe("1");
  });

  it("picks the first published episode in season and episode order for direct series entry", () => {
    const seasons = [{ id: "s2", season_number: 2 }, { id: "s1", season_number: 1 }];
    const episodes = [
      { id: "ep-s2-1", season_id: "s2", episode_number: 1 },
      { id: "ep-s1-2", season_id: "s1", episode_number: 2 },
      { id: "ep-s1-1", season_id: "s1", episode_number: 1 },
    ];
    expect(firstEpisode(episodes, seasons)?.id).toBe("ep-s1-1");
    expect(firstEpisode([], seasons)).toBeNull();
    const ordered = orderEpisodes(episodes, seasons);
    expect(episodeNeighbors(ordered, "ep-s1-2")).toEqual({ prev: episodes[2], next: episodes[0] });
  });
});
