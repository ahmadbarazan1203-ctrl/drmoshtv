import type { Genre, SeriesWithGenres } from "@/lib/api";

export const RECENT_SERIES_LIMIT = 12;

export type HomeGroup = "arabic" | "foreign" | "special";
export type HomeSection = "all" | "genres" | HomeGroup;
type GenreNames = Pick<Genre, "slug" | "name_ar" | "name_en" | "name_fr" | "name_tr">;

const GROUP_ALIASES: Record<HomeGroup, string[]> = {
  arabic: ["arabic", "arabic series", "عربي", "عربية", "مسلسلات عربية", "المسلسلات العربية", "series arabes", "arap dizileri"],
  foreign: ["foreign", "foreign series", "international", "أجنبي", "أجنبية", "مسلسلات أجنبية", "المسلسلات الأجنبية", "series etrangeres", "yabanci diziler"],
  special: ["special", "special collection", "مجموعة خاصة", "خاصة", "collection speciale", "ozel koleksiyon"],
};

function normalizeKey(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const NORMALIZED_ALIASES = Object.fromEntries(
  Object.entries(GROUP_ALIASES).map(([group, aliases]) => [group, new Set(aliases.map(normalizeKey))]),
) as Record<HomeGroup, Set<string>>;

export function genreGroup(genre: GenreNames): HomeGroup | null {
  const values = [genre.slug, genre.name_ar, genre.name_en, genre.name_fr, genre.name_tr].map(normalizeKey);
  for (const group of ["arabic", "foreign", "special"] as const) {
    if (values.some((value) => NORMALIZED_ALIASES[group].has(value))) return group;
  }
  return null;
}

export function splitSeriesByAdded(series: SeriesWithGenres[], recentLimit = RECENT_SERIES_LIMIT) {
  const ordered = [...series].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { recent: ordered.slice(0, recentLimit), older: ordered.slice(recentLimit) };
}

export function seriesForGroup(series: SeriesWithGenres[], genres: Genre[], group: HomeGroup) {
  const ids = new Set(genres.filter((genre) => genreGroup(genre) === group).map((genre) => genre.id));
  return series.filter((item) => item.series_genres.some((genre) => ids.has(genre.genre_id)));
}

export function seriesForGenre(series: SeriesWithGenres[], genreId: string) {
  return series.filter((item) => item.series_genres.some((genre) => genre.genre_id === genreId));
}
