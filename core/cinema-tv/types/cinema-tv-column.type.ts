import type { TGenre } from "./genre.type";
import type { TType } from "./type.type";



export type TCinemaTvRowColumn = {
  url: string;
  title: string;
  poster: string;
  franchise: string;

  type: TType;
  genre: TGenre;
};
