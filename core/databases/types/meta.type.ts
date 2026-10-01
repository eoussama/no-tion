import type { TNullable } from "@eoussama/core";
import type { TDatabaseSchema, TPageIcon } from "../../notion";
import type { TRow } from "./definition.type";



/**
 * @description
 * Database summary, as listed by `/api/db`.
 */
export type TDatabaseMeta = {
  slug: string;
  id: string;
  dataSourceId: TNullable<string>;
  title: string;
  icon: TPageIcon;
  url: TNullable<string>;
  registered: boolean;
  lastEditedTime: TNullable<string>;
};

/**
 * @description
 * Response of `/api/db/:slug`.
 */
export type TDatabaseInfo = {
  meta: TDatabaseMeta;
  schema: TDatabaseSchema;
};

/**
 * @description
 * Response of `/api/db/:slug/rows`.
 */
export type TRowsResponse = {
  rows: Array<TRow>;
  fetchedAt: string;
};
