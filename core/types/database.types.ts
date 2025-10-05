import type { TNullable } from "@eoussama/core";



export type TDatabasePage = {
  id: string;
  infoUrl: TNullable<string>;
};

export type TDatabasePagesResponse = {
  pages: Array<TDatabasePage>;
};
