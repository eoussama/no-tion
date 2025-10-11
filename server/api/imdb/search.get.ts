import type { TImdbSearchResponse } from "~/core";



export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchQuery = query.q as string;

  if (!searchQuery || searchQuery.length < 2) {
    return { titles: [] };
  }

  try {
    const response = await $fetch<TImdbSearchResponse>(`https://api.imdbapi.dev/search/titles`, {
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
    const cause = error instanceof Error ? error : new Error("Failed to search IMDB");

    throw createError({
      statusCode: 502,
      statusMessage: "Failed to search IMDB",
      cause,
    });
  }
});
