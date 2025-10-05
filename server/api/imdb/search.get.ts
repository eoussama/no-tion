export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchQuery = query.q as string;

  if (!searchQuery || searchQuery.length < 2) {
    return { titles: [] };
  }

  try {
    const response = await $fetch<{ titles: Array<{
      id: string;
      primaryTitle: string;
      type: string;
      startYear?: number;
      primaryImage?: { url: string };
      runtimeSeconds?: number;
      rating?: { aggregateRating: number; voteCount: number };
    }>; }>(`https://api.imdbapi.dev/search/titles`, {
      params: {
        query: searchQuery,
        limit: 10,
      },
    });

    return {
      titles: response.titles || [],
    };
  }
  catch (error) {
    console.error("IMDB API search error:", error);

    return { titles: [] };
  }
});
