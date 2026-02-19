import type { PageObjectResponse } from "@notionhq/client";
import type { TCinemaTvColumnNotionProperties } from "./cinema-tv-column-notion-properties.type";
import type { TNullable } from "@eoussama/core";



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
