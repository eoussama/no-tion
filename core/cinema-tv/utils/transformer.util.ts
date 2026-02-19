import type { TResponse } from "~~/core/common";
import type { TCinemaTvColumnNotionDatabase, TCinemaTvDatabase, TGenre, TType } from "../types";



type TTransformCinemaTvInput = TResponse<TCinemaTvColumnNotionDatabase>;
type TTransformCinemaTvOutput = TResponse<TCinemaTvDatabase>;

/**
 * @description
 * Transforms the raw API response for the Cinema TV database into a structured format suitable for the application.
 *
 * @param response The raw API response containing the Cinema TV database data.
 * @returns The transformed API response for the Cinema TV database.
 */
export function transformCinemaTv(response: TTransformCinemaTvInput): TTransformCinemaTvOutput {
  if (!response || response.error || !response.data) {
    return response as unknown as TTransformCinemaTvOutput;
  }

  const rows = response.data.rows.map((row) => {
    return {
      id: row.id,
      url: row.properties.Info.url ?? "",
      poster: row.cover?.external.url ?? "",
      title: row.properties.Name.title[0]?.plain_text ?? "",
      type: (row.properties.Type.select?.name as TType) ?? "Other",
      genre: (row.properties.Genre.select?.name as TGenre) ?? "Other",
      franchises: row.properties.Franchises.multi_select.map(franchise => franchise.name) ?? [],
    } satisfies TCinemaTvDatabase["rows"][number];
  });

  return {
    ...response,
    data: {
      ...response.data,
      rows,
    },
  };
}
