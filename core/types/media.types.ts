import type { GENRE_OPTIONS } from "../constants/genre.constants";
import type { MEDIA_TYPE_OPTIONS } from "../constants/media.constants";
import type { MediaSourceType } from "../enums/media.enums";



export type TGenreOption = typeof GENRE_OPTIONS[number];
export type TMediaType = typeof MEDIA_TYPE_OPTIONS[number];

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
