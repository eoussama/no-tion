export type TImdbTitle = {
  id: string;
  primaryTitle: string;
  type: string;
  startYear?: number;
  primaryImage?: { url: string };
  runtimeSeconds?: number;
  rating?: { aggregateRating: number; voteCount: number };
};

export type TImdbSearchResponse = {
  titles: Array<TImdbTitle>;
};
