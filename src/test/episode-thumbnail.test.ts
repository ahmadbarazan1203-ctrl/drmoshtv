import { describe, expect, it } from "vitest";
import { episodeThumbnail } from "@/lib/api";

describe("Episode thumbnail inheritance", () => {
  it("uses the series poster when the episode has no custom thumbnail", () => {
    expect(episodeThumbnail({ thumbnail_url: null }, "https://cdn.example.com/series-poster.jpg"))
      .toBe("https://cdn.example.com/series-poster.jpg");
  });

  it("keeps a custom episode thumbnail instead of the series poster", () => {
    expect(episodeThumbnail({ thumbnail_url: "https://cdn.example.com/episode.jpg" }, "https://cdn.example.com/series-poster.jpg"))
      .toBe("https://cdn.example.com/episode.jpg");
  });
});
