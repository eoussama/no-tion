import type { GENRES } from "../consts/genres.const";
import type { TYPES } from "../consts/types.const";
import type { TSourceType } from "./source-type.type";



export type TGenreOption = typeof GENRES[number];
export type TMediaType = typeof TYPES[number];

export type TToastKind = "success" | "error";

export type TToastMessage = {
  message: string;
  type: TToastKind;
};

export type TOtherMediaForm = {
  title: string;
  url: string;
  posterUrl: string;
  type: TMediaType;
  genre: TGenreOption;
};

export type TImdbMediaForm = {
  title: string;
  type: string;
  url: string;
  posterUrl: string;
  genre: TGenreOption;
};

export type TMediaSubmissionPayload = TImdbMediaForm | TOtherMediaForm;

export type TMediaFormState = {
  sourceType: TSourceType;
  genre: TGenreOption;
};
