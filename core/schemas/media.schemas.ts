import { z } from "zod";

import { GENRE_OPTIONS } from "../constants/genre.constants";
import { MEDIA_TYPE_OPTIONS } from "../constants/media.constants";
import { MediaSourceType } from "../enums/media.enums";



export const genreSchema = z.enum(GENRE_OPTIONS);
export const mediaTypeSchema = z.enum(MEDIA_TYPE_OPTIONS);
export const mediaSourceSchema = z.nativeEnum(MediaSourceType);

const optionalUrlSchema = z.string().url();

export const databaseAddRequestSchema = z.object({
  databaseId: z.string().min(1, "Database ID is required"),
  title: z.string().min(1, "Title is required"),
  type: mediaTypeSchema,
  url: z.string().url("A valid URL is required"),
  posterUrl: optionalUrlSchema.optional(),
  genre: genreSchema,
});

export const imdbSearchQuerySchema = z.string().trim().min(2, "Enter at least 2 characters");

export const imdbTitleSchema = z.object({
  id: z.string().min(1),
  primaryTitle: z.string().min(1),
  type: z.string().min(1),
  startYear: z.number().int().optional(),
  primaryImage: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  runtimeSeconds: z.number().int().optional(),
  rating: z
    .object({
      aggregateRating: z.number(),
      voteCount: z.number().optional(),
    })
    .optional(),
});

export const imdbSearchResponseSchema = z.object({
  titles: z.array(imdbTitleSchema).default([]),
});

export type TDatabaseAddRequestSchema = typeof databaseAddRequestSchema;
