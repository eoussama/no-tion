import { describe, expect, it } from "vitest";
import { formatLookupMeta } from "../core";
import { searchLookup } from "../server/utils/lookup";
import { firstReleaseDate, mapTmdbResult, STmdbDetails, STmdbSearchResult } from "../server/utils/lookup/tmdb.provider";



describe("lookup providers", () => {
  it("maps a TMDB result, with and without an IMDb id", () => {
    const tv = STmdbSearchResult.parse({ id: 1396, media_type: "tv", name: "Breaking Bad", first_air_date: "2008-01-20", poster_path: "/bb.jpg", vote_average: 8.91 });

    const withImdb = mapTmdbResult(tv, "tt0903747");

    expect(withImdb).toMatchObject({ id: "tt0903747", url: "https://www.imdb.com/title/tt0903747/", type: "tvSeries", year: 2008, image: "https://image.tmdb.org/t/p/w500/bb.jpg", rating: 8.9 });
    expect(formatLookupMeta(withImdb)).toBe("TV Series · ★ 8.9");
    expect(mapTmdbResult(tv, null)).toMatchObject({ id: "tmdb:tv:1396", imdbId: null, url: "https://www.themoviedb.org/tv/1396" });
  });

  it("picks the first ever release: the earliest of a movie's release dates", () => {
    const movie = STmdbSearchResult.parse({ id: 27205, media_type: "movie", title: "Inception", release_date: "2010-07-15" });
    const details = STmdbDetails.parse({
      release_date: "2010-07-15",
      external_ids: { imdb_id: "tt1375666" },
      release_dates: {
        results: [
          { iso_3166_1: "US", release_dates: [{ release_date: "2010-07-16T00:00:00.000Z" }, { release_date: "2010-07-08T00:00:00.000Z" }] },
          { iso_3166_1: "FR", release_dates: [{ release_date: "2010-07-21T00:00:00.000Z" }] },
        ],
      },
    });

    expect(firstReleaseDate(movie, details)).toBe("2010-07-08");
    expect(mapTmdbResult(movie, "tt1375666", firstReleaseDate(movie, details))).toMatchObject({ releaseDate: "2010-07-08", year: 2010 });
  });

  it("uses a show's first air date, and falls back to the search result without details", () => {
    const show = STmdbSearchResult.parse({ id: 1396, media_type: "tv", name: "Breaking Bad", first_air_date: "2008-01-20" });

    expect(firstReleaseDate(show, STmdbDetails.parse({ first_air_date: "2008-01-20" }))).toBe("2008-01-20");
    expect(firstReleaseDate(show, null)).toBe("2008-01-20");
    expect(firstReleaseDate(STmdbSearchResult.parse({ id: 1, media_type: "movie", title: "Unknown", release_date: "" }), null)).toBeNull();
  });

  it("rejects TMDB people", () => {
    expect(STmdbSearchResult.safeParse({ id: 1, media_type: "person", name: "Someone" }).success).toBe(false);
  });

  it("falls back to the next provider and never leaks upstream URLs (API keys) in errors", async () => {
    const leaky = { name: "tmdb", search: () => Promise.reject(new Error("[GET] \"https://api.themoviedb.org/3/search/multi?api_key=SECRET\": <no response> fetch failed")) };
    const failing = { name: "tmdb-primary", search: () => Promise.reject(Object.assign(new Error("x"), { statusCode: 503 })) };
    const working = { name: "ok", search: () => Promise.resolve([]) };

    await expect(searchLookup([failing, working], "dune", 10)).resolves.toEqual([]);
    await expect(searchLookup([failing, leaky], "dune", 10)).rejects.toThrow("Lookup failed (tmdb-primary: HTTP 503; tmdb: <no response> fetch failed)");
    await expect(searchLookup([leaky], "dune", 10)).rejects.not.toThrow(/SECRET/);
  });
});
