import type { PageObjectResponse } from "@notionhq/client";



export type TNotionDatabaseRow<T> = Pick<PageObjectResponse, "id"> & T;
