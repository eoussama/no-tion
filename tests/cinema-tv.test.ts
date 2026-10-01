import type { PageObjectResponse } from "@notionhq/client";
import type { TDatabaseSchema, TLookupResult, TRow } from "../core";
import type { TCinemaTvValues } from "../core/databases/cinema-tv";

import { describe, expect, it } from "vitest";
import {
  buildGenericDefinition,
  CINEMA_TV_DEFINITION,
  cinemaTvLookupToInput,
  cleanInput,
  emptyInput,
  findCinemaTvDuplicate,
  inputToNotion,
  mapTitleType,
  registerDatabase,
  rowFromPage,
  SCinemaTvInput,
  validateOptions,
} from "../core";



/** The "Type" options of the live Notion database (checked with `dataSources.retrieve`). */
const LIVE_TYPES = ["Movie", "TV Show", "Documentary", "Other", "TV Mini-Series", "TV Series"];

const SCHEMA: TDatabaseSchema = {
  dataSourceId: "ds",
  titleProperty: "Name",
  properties: {
    Type: { id: "t", name: "Type", kind: "select", writable: true, options: LIVE_TYPES.map(name => ({ id: name, name, color: "default" })) },
    Genre: { id: "g", name: "Genre", kind: "select", writable: true, options: [{ id: "o", name: "Other", color: "pink" }, { id: "h", name: "Hollywood", color: "blue" }] },
  },
};

function result(overrides: Partial<TLookupResult> = {}): TLookupResult {
  return {
    id: "tt1375666",
    source: "tmdb",
    title: "Inception",
    url: "https://www.imdb.com/title/tt1375666/",
    imdbId: "tt1375666",
    year: 2010,
    releaseDate: "2010-07-08",
    type: "movie",
    image: "https://m.media-amazon.com/images/M/inception.jpg",
    runtimeSeconds: 8880,
    rating: 8.8,
    ...overrides,
  };
}

function row(id: string, url: string | null): TRow<TCinemaTvValues> {
  return {
    id,
    notionUrl: "",
    cover: null,
    icon: null,
    createdTime: "",
    lastEditedTime: "",
    values: { title: id, url, type: "Movie", genre: null, franchises: [], status: null, season: null, episode: null, score: null, release: null, poster: null },
  };
}

describe("cinema-tv lookup mapping", () => {
  it.each([
    ["movie", "Movie"],
    ["tvMovie", "Movie"],
    ["short", "Movie"],
    ["video", "Movie"],
    ["tvSeries", "TV Series"],
    ["tvMiniSeries", "TV Mini-Series"],
    ["tvSpecial", "TV Show"],
    ["videoGame", "Other"],
    ["somethingNew", "Other"],
  ])("maps IMDb type %s to the live option %s", (imdbType, expected) => {
    expect(mapTitleType(imdbType, LIVE_TYPES)).toBe(expected);
    expect(LIVE_TYPES).toContain(expected);
  });

  it("falls back to Other, or nothing, when the mapped option does not exist", () => {
    expect(mapTitleType("tvSeries", ["Movie", "Other"])).toBe("Other");
    expect(mapTitleType("tvSeries", ["Movie"])).toBeNull();
    expect(mapTitleType(null, [])).toBe("Other");
  });

  it("prefills title, type, IMDb URL, poster and first release", () => {
    expect(cinemaTvLookupToInput(result({ type: "tvSeries" }), { schema: SCHEMA })).toEqual({
      title: "Inception",
      type: "TV Series",
      url: "https://www.imdb.com/title/tt1375666/",
      poster: "https://m.media-amazon.com/images/M/inception.jpg",
      release: "2010-07-08",
    });
  });

  it("leaves Release untouched when the release date is unknown", () => {
    expect(cinemaTvLookupToInput(result({ releaseDate: null }), { schema: SCHEMA }).release).toBeUndefined();
  });

  it("uses the provider URL when there is no IMDb id", () => {
    const input = cinemaTvLookupToInput(result({ imdbId: null, url: "https://www.themoviedb.org/movie/27205", image: null }), { schema: SCHEMA });

    expect(input.url).toBe("https://www.themoviedb.org/movie/27205");
    expect(input.poster).toBe("");
  });

  it("produces a valid create input once merged with the defaults", () => {
    const def = registerDatabase(CINEMA_TV_DEFINITION);
    const input = cleanInput(def, { ...emptyInput(def), ...cinemaTvLookupToInput(result(), { schema: SCHEMA }) });

    expect(input.status).toBe("To Watch");
    expect(input.genre).toBe("Other");
    expect(input.release).toBe("2010-07-08");
    expect(SCinemaTvInput.safeParse(input).success).toBe(true);
    expect(validateOptions(def, input, SCHEMA)).toEqual({});
    expect(validateOptions(def, { ...input, type: "Sitcom" }, SCHEMA)).toHaveProperty("type");
  });

  it("locks type and URL", () => {
    expect(CINEMA_TV_DEFINITION.lookup?.locked).toEqual(["type", "url"]);
  });
});

describe("cinema-tv duplicates", () => {
  const rows = [
    row("a", "https://www.imdb.com/title/tt1375666/?ref_=nv_sr_srsg_0"),
    row("b", "https://2m.ma/fr/some-show/"),
    row("c", null),
  ];

  it("matches the same IMDb title whatever the URL suffix", () => {
    expect(findCinemaTvDuplicate({ url: "https://www.imdb.com/title/tt1375666/" }, rows)?.id).toBe("a");
    expect(findCinemaTvDuplicate({ url: "https://m.imdb.com/title/tt1375666" }, rows)?.id).toBe("a");
    expect(findCinemaTvDuplicate({ url: "https://www.imdb.com/title/tt0000001/" }, rows)).toBeUndefined();
  });

  it("matches other links by normalized URL", () => {
    expect(findCinemaTvDuplicate({ url: "http://2m.ma/fr/some-show" }, rows)?.id).toBe("b");
    expect(findCinemaTvDuplicate({ url: "" }, rows)).toBeUndefined();
  });
});

describe("cinema-tv notion mapping", () => {
  const def = registerDatabase(CINEMA_TV_DEFINITION);

  it("hides season and episode unless the type is a series", () => {
    const movie = cleanInput(def, { ...emptyInput(def), type: "Movie", season: 2, episode: 3 });
    const series = cleanInput(def, { ...emptyInput(def), type: "TV Series", season: 2, episode: 3 });

    expect([movie.season, movie.episode]).toEqual([null, null]);
    expect([series.season, series.episode]).toEqual([2, 3]);
  });

  it("writes the poster as the page cover and the fields as properties", () => {
    const write = inputToNotion(def, { title: "Inception", type: "Movie", url: "https://www.imdb.com/title/tt1375666/", status: "To Watch", poster: "https://img/p.jpg", franchises: ["Christopher Nolan"] });

    expect(write.cover).toBe("https://img/p.jpg");
    expect(write.properties.Name).toEqual({ title: [{ type: "text", text: { content: "Inception" } }] });
    expect(write.properties.Type).toEqual({ select: { name: "Movie" } });
    expect(write.properties.Info).toEqual({ url: "https://www.imdb.com/title/tt1375666/" });
    expect(write.properties.Status).toEqual({ status: { name: "To Watch" } });
    expect(write.properties.Franchises).toEqual({ multi_select: [{ name: "Christopher Nolan" }] });
    expect(write.properties).not.toHaveProperty("Genre");
  });

  it("reads a page into a row", () => {
    const page = {
      id: "p1",
      url: "https://www.notion.so/p1",
      created_time: "2026-01-01T00:00:00.000Z",
      last_edited_time: "2026-01-02T00:00:00.000Z",
      icon: null,
      cover: { type: "external", external: { url: "https://img/p.jpg" } },
      properties: {
        Name: { id: "title", type: "title", title: [{ plain_text: "Inception" }] },
        Type: { id: "t", type: "select", select: { id: "1", name: "Movie", color: "blue" } },
        Info: { id: "i", type: "url", url: "https://www.imdb.com/title/tt1375666/" },
        Franchises: { id: "f", type: "multi_select", multi_select: [] },
        Score: { id: "s", type: "number", number: 9 },
      },
    } as unknown as PageObjectResponse;

    const parsed = CINEMA_TV_DEFINITION.rowSchema.safeParse(rowFromPage(def, page));

    expect(parsed.success).toBe(true);
    expect(parsed.data?.values).toMatchObject({ title: "Inception", type: "Movie", poster: "https://img/p.jpg", score: 9, franchises: [], genre: null });
  });
});

describe("generic definition", () => {
  it("builds unique, form-safe keys and an input schema from a live schema", () => {
    const def = buildGenericDefinition(
      { slug: "abc", id: "abc", dataSourceId: "ds", title: "Books", icon: { type: "emoji", value: "📚" }, url: null, registered: false, lastEditedTime: null },
      {
        dataSourceId: "ds",
        titleProperty: "Title",
        properties: {
          "Pages #": { id: "1", name: "Pages #", kind: "number", writable: true },
          "Title": { id: "title", name: "Title", kind: "title", writable: true },
          "pages": { id: "2", name: "pages", kind: "rich_text", writable: true },
          "Author(s)": { id: "3", name: "Author(s)", kind: "people", writable: false },
        },
      },
    );

    expect(def.fields.map(field => field.key)).toEqual(["title", "pages", "pages2", "authorS", "cover"]);
    expect(def.titleField).toBe("title");
    expect(def.icon).toBe("📚");
    expect(def.inputSchema.safeParse({ title: "Dune", pages: 412, pages2: "", cover: "" }).success).toBe(true);
    expect(def.inputSchema.safeParse({ pages: "many" }).success).toBe(false);
  });
});
