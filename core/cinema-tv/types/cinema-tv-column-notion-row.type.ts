import type { TNullable } from "@eoussama/core";
import type { PageObjectResponse } from "@notionhq/client";
import type { TCinemaTvColumnNotionProperties } from "./cinema-tv-column-notion-properties.type";



type TCover = {
  type: "external";
  external: {
    url: string;
  };
};

export type TCinemaTvColumnNotionRow = PageObjectResponse & {
  cover: TNullable<TCover>;
  properties: TCinemaTvColumnNotionProperties;
};
