import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { I18nProvider } from "@/lib/i18n";
import { autoplayEmbed, episodeSwipe, playerEnded } from "@/lib/playback";

describe("Episode playback", () => {
  it("starts direct episode files automatically and muted", () => {
    const { container } = render(<I18nProvider><VideoPlayer url="https://cdn.example.org/episode.mp4" title="Episode" autoPlay /></I18nProvider>);
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("autoplay");
    expect(video?.muted).toBe(true);
  });

  it("adds autoplay to external players without dropping existing parameters", () => {
    const url = new URL(autoplayEmbed("https://voe.sx/e/kxvjsnzvwuuj?quality=hd"));
    expect(url.searchParams.get("quality")).toBe("hd");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("muted")).toBe("1");
    const youtube = new URL(autoplayEmbed("https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0"));
    expect(youtube.searchParams.get("mute")).toBe("1");
  });

  it("advances when a direct episode finishes", () => {
    const onEnded = vi.fn();
    const { container } = render(<I18nProvider><VideoPlayer url="https://cdn.example.org/episode.mp4" title="Episode" onEnded={onEnded} autoPlay /></I18nProvider>);
    fireEvent.ended(container.querySelector("video")!);
    expect(onEnded).toHaveBeenCalledOnce();
  });

  it("accepts end notifications only from the active external player origin", () => {
    const onEnded = vi.fn();
    render(<I18nProvider><VideoPlayer url="https://voe.sx/e/kxvjsnzvwuuj" title="Episode" onEnded={onEnded} autoPlay /></I18nProvider>);
    fireEvent(window, new MessageEvent("message", { data: { event: "ended" }, origin: "https://other.example" }));
    expect(onEnded).not.toHaveBeenCalled();
    fireEvent(window, new MessageEvent("message", { data: { event: "ended" }, origin: "https://voe.sx" }));
    expect(onEnded).toHaveBeenCalledOnce();
    expect(playerEnded(JSON.stringify({ event: "onStateChange", info: 0 }))).toBe(true);
    expect(playerEnded({ event: "timeupdate" })).toBe(false);
  });

  it("uses swipe up for next and swipe down for previous with a deliberate vertical gesture", () => {
    expect(episodeSwipe(500, 300)).toBe("next");
    expect(episodeSwipe(300, 500)).toBe("prev");
    expect(episodeSwipe(500, 470)).toBeNull();
    expect(episodeSwipe(500, 300, 100, 350)).toBeNull();
  });
});
