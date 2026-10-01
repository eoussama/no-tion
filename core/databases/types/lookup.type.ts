import type { TNullable } from "@eoussama/core";



/**
 * @description
 * A normalized title lookup result, from whichever provider produced it (TMDB today).
 */
export type TLookupResult = {
  /** Provider-unique identifier (the IMDb id when known). */
  id: string;
  /** The provider that produced this result. */
  source: string;
  title: string;
  /** The canonical URL of the title (IMDb when known). */
  url: string;
  imdbId: TNullable<string>;
  year: TNullable<number>;
  /** First ever release (`YYYY-MM-DD`): earliest release date for a movie, first air date for a show. */
  releaseDate: TNullable<string>;
  /** IMDb-style title type (`movie`, `tvSeries`, `tvMiniSeries`, ...). */
  type: TNullable<string>;
  image: TNullable<string>;
  runtimeSeconds: TNullable<number>;
  rating: TNullable<number>;
};
