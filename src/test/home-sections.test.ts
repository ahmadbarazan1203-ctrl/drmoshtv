import { describe, expect, it } from "vitest";
import type { Genre, SeriesWithGenres } from "@/lib/api";
import { genreGroup, seriesForGenre, seriesForGroup, splitSeriesByAdded } from "@/lib/home-sections";

function makeSeries(id: string, createdAt: string, genreIds: string[] = []) {
  return { id, created_at: createdAt, series_genres: genreIds.map((genre_id) => ({ genre_id })) } as SeriesWithGenres;
}

function makeGenre(id: string, slug: string, nameAr: string): Genre {
  return { id, slug, name_ar: nameAr, name_en: slug, name_fr: slug, name_tr: slug, created_at: "2026-01-01" };
}

describe("Homepage series sections", () => {
  it("sorts the latest twelve additions first and leaves older series below", () => {
    const series = Array.from({ length: 14 }, (_, index) => makeSeries(`series-${index}`, `2026-01-${String(index + 1).padStart(2, "0")}`)).reverse();
    const { recent, older } = splitSeriesByAdded(series);

    expect(recent).toHaveLength(12);
    expect(recent[0]?.id).toBe("series-13");
    expect(recent.at(-1)?.id).toBe("series-2");
    expect(older.map((item) => item.id)).toEqual(["series-1", "series-0"]);
  });

  it("filters Arabic and special collections by their assigned genres", () => {
    const arabic = makeGenre("arabic-id", "custom-arabic", "المسلسلات العربية");
    const foreign = makeGenre("foreign-id", "foreign", "أجنبي");
    const special = makeGenre("special-id", "custom-special", "مجموعة خاصة");
    const arabicSeries = makeSeries("arabic-series", "2026-02-01", [arabic.id]);
    const foreignSeries = makeSeries("foreign-series", "2026-02-02", [foreign.id]);
    const specialSeries = makeSeries("special-series", "2026-02-03", [special.id]);
    const series = [arabicSeries, foreignSeries, specialSeries];
    const genres = [arabic, foreign, special];

    expect(genreGroup(arabic)).toBe("arabic");
    expect(seriesForGroup(series, genres, "arabic")).toEqual([arabicSeries]);
    expect(seriesForGroup(series, genres, "special")).toEqual([specialSeries]);
  });

  it("shows only series assigned to the selected custom genre", () => {
    const family = makeGenre("family-id", "family", "عائلي");
    const familySeries = makeSeries("family-series", "2026-02-01", [family.id]);
    const otherSeries = makeSeries("other-series", "2026-02-02", ["other-id"]);

    expect(seriesForGenre([familySeries, otherSeries], family.id)).toEqual([familySeries]);
  });
});
