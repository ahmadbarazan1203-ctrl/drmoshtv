import { describe, expect, it } from "vitest";
import { parseImageUrl } from "@/lib/media-url";
import { parseVideo } from "@/lib/api";

describe("External media", () => {
  it("accepts externally hosted images without requiring a filename extension", () => {
    expect(parseImageUrl(" https://images.example.org/image?id=42&token=abc ")).toBe("https://images.example.org/image?id=42&token=abc");
  });
  it("rejects unsafe image schemes and embedded credentials", () => {
    for (const url of ["javascript:alert(1)", "data:image/png;base64,abc", "http://example.org/a.png", "https://user:pass@example.org/a.png", "not a url"]) {
      expect(parseImageUrl(url)).toBeNull();
    }
  });
  it("plays direct external video links and preserves signed parameters", () => {
    expect(parseVideo("https://videos.example.org/episode.mp4?token=abc")).toEqual({ kind: "file", src: "https://videos.example.org/episode.mp4?token=abc" });
  });
  it("keeps supported external video embeds", () => {
    expect(parseVideo("https://youtu.be/abcdefghijk")?.kind).toBe("youtube");
    expect(parseVideo("https://vimeo.com/12345678")?.kind).toBe("vimeo");
  });
});