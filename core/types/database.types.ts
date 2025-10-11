import type { TNullable } from "@eoussama/core";

import type { TGenreOption } from "./media.types";



export type TDatabasePage = {
  id: string;
  infoUrl: TNullable<string>;
};

export type TDatabasePagesResponse = {
  pages: Array<TDatabasePage>;
};

export type TDatabaseAddRequest = {
  databaseId: string;
  title: string;
  type: string;
  url: string;
  posterUrl?: string;
  genre: TGenreOption;
};
