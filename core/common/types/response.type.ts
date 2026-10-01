import type { TNullable } from "@eoussama/core";



export type TResponse<T> = {
  url: string;
  error: boolean;
  message: string;
  statusCode: number;
  statusMessage: string;

  data: TNullable<T>;
  stack: TNullable<Array<string>>;
};
