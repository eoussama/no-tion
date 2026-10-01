import type { TDatabaseDefinition, TRowValues } from "../types";
import type { TCinemaTvInput, TCinemaTvValues } from "./schema";

import { CINEMA_TV_DATABASE_ID, CINEMA_TV_GENRES, CINEMA_TV_SERIES_TYPES, CINEMA_TV_STATUSES, CINEMA_TV_TYPES, CINEMA_TV_PROPERTIES as P } from "./consts";
import { CINEMA_TV_LOOKUP } from "./lookup";
import { SCinemaTvInput, SCinemaTvRow } from "./schema";



function isSeries(values: Partial<TCinemaTvInput>): boolean {
  return typeof values.type === "string" && CINEMA_TV_SERIES_TYPES.includes(values.type);
}

/**
 * @description
 * Gallery card subtitle: progress for series ("Season 3 · Episode 7"), otherwise the franchises or the genre.
 *
 * @param values - The row values.
 * @returns The subtitle.
 */
function gallerySubtitle(values: TRowValues): string {
  const { season, episode, franchises, genre } = values;

  if (isSeries(values as Partial<TCinemaTvInput>) && typeof season === "number") {
    return typeof episode === "number" ? `Season ${season} · Episode ${episode}` : `Season ${season}`;
  }

  if (Array.isArray(franchises) && franchises.length > 0) {
    return franchises.join(", ");
  }

  return typeof genre === "string" ? genre : "";
}

export const CINEMA_TV_DEFINITION: TDatabaseDefinition<TCinemaTvValues, TCinemaTvInput> = {
  slug: "cinema-tv",
  id: CINEMA_TV_DATABASE_ID,
  title: "Cinema & TV",
  icon: "🎬",
  description: "Movies and shows, watched and to watch.",
  registered: true,
  titleField: "title",
  fields: [
    { key: "poster", kind: "cover", label: "Poster", column: false, placeholder: "https://..." },
    { key: "title", property: P.title, kind: "title", label: "Title", required: true, placeholder: "Inception" },
    { key: "type", property: P.type, kind: "select", label: "Type", required: true, options: CINEMA_TV_TYPES },
    { key: "genre", property: P.genre, kind: "select", label: "Genre", options: CINEMA_TV_GENRES },
    { key: "status", property: P.status, kind: "status", label: "Status", options: CINEMA_TV_STATUSES },
    { key: "franchises", property: P.franchises, kind: "multi_select", label: "Franchises" },
    { key: "season", property: P.season, kind: "number", label: "Season", visibleWhen: isSeries },
    { key: "episode", property: P.episode, kind: "number", label: "Episode", visibleWhen: isSeries },
    { key: "score", property: P.score, kind: "number", label: "Score", description: "Out of 10" },
    { key: "release", property: P.release, kind: "date", label: "Release" },
    { key: "url", property: P.url, kind: "url", label: "Info", required: true, placeholder: "https://www.imdb.com/title/..." },
  ],
  rowSchema: SCinemaTvRow,
  inputSchema: SCinemaTvInput,
  defaults: { status: "To Watch", genre: "Other" },
  views: { default: "gallery", gallery: { cover: "poster", badges: ["type", "status"], subtitle: gallerySubtitle } },
  lookup: CINEMA_TV_LOOKUP,
};
