import type { GENRES } from "../constants/genres.const";
import type { TYPES } from "../constants/types.const";
import type { MediaSourceType } from "../enums/media.enums";



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
  sourceType: MediaSourceType;
  genre: TGenreOption;
};
