/**
 * @description
 * The Notion database id of "Cinema & TV".
 */
export const CINEMA_TV_DATABASE_ID = "279d999481b3811e8041d1b324f31226";

/**
 * @description
 * Field key → Notion property name.
 */
export const CINEMA_TV_PROPERTIES = {
  title: "Name",
  url: "Info",
  type: "Type",
  genre: "Genre",
  franchises: "Franchises",
  status: "Status",
  season: "Season",
  episode: "Episode",
  score: "Score",
  release: "Release",
} as const;

/**
 * @description
 * Fallback "Type" options; the live schema wins.
 */
export const CINEMA_TV_TYPES = ["Movie", "TV Show", "TV Series", "TV Mini-Series", "Documentary", "Other"] as const;

/**
 * @description
 * "Type" options that have seasons and episodes.
 */
export const CINEMA_TV_SERIES_TYPES: ReadonlyArray<string> = ["TV Show", "TV Series", "TV Mini-Series"];

/**
 * @description
 * Fallback "Genre" options; the live schema wins.
 */
export const CINEMA_TV_GENRES = ["Hollywood", "Bollywood", "Arabic", "Anime", "Animation", "Cartoon", "Kdrama", "Jdrama", "Cdrama", "Lorocco", "Other"] as const;

/**
 * @description
 * Fallback "Status" options; the live schema wins.
 */
export const CINEMA_TV_STATUSES = ["To Watch", "Watching", "Paused", "Watched", "Rewatching"] as const;

/**
 * @description
 * The "Type" used when an IMDb title type has no better match.
 */
export const CINEMA_TV_FALLBACK_TYPE = "Other";

/**
 * @description
 * IMDb title type → "Type" option, mapped onto the options that exist in the live Notion schema
 * (Movie, TV Show, TV Series, TV Mini-Series, Documentary, Other), so a lookup never creates a new option.
 * Ported from `TITLE_TYPE_MAP` (tag 0.0.3), which targeted options the database does not have.
 */
export const IMDB_TYPE_TO_CINEMA_TV_TYPE: Record<string, string> = {
  movie: "Movie",
  tvMovie: "Movie",
  short: "Movie",
  tvShort: "Movie",
  video: "Movie",
  tvSeries: "TV Series",
  tvMiniSeries: "TV Mini-Series",
  tvSpecial: "TV Show",
  tvEpisode: "TV Show",
  videoGame: "Other",
};
