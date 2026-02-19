import type { TResponse } from "~~/core/common";
import type { TCinemaTvDatabase } from "../types";



type TTransformCinemaTvResponse = TResponse<TCinemaTvDatabase>;

/**
 * @description
 * A transformer function for the Cinema TV database response. This function can be used to transform the raw API response into a more usable format for the application.
 *
 * @param response The raw API response for the Cinema TV database.
 * @returns The transformed API response for the Cinema TV database.
 */
export function transformCinemaTv(response: TTransformCinemaTvResponse): TTransformCinemaTvResponse {
  return response;
}
