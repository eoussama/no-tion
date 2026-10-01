import { z } from "zod";
import { SBaseRow } from "../utils";



export const SCinemaTvValues = z.object({
  title: z.string(),
  url: z.string().nullable(),
  type: z.string().nullable(),
  genre: z.string().nullable(),
  franchises: z.array(z.string()),
  status: z.string().nullable(),
  season: z.number().nullable(),
  episode: z.number().nullable(),
  score: z.number().nullable(),
  release: z.string().nullable(),
  poster: z.string().nullable(),
});

export const SCinemaTvRow = SBaseRow.extend({ values: SCinemaTvValues });

export const SCinemaTvInput = z.object({
  title: z.string("Title is required").trim().min(1, "Title is required"),
  url: z.url({ error: "A valid URL is required", protocol: /^https?$/ }),
  type: z.string("Type is required").min(1, "Type is required"),
  genre: z.string().nullable().optional(),
  franchises: z.array(z.string()).optional(),
  status: z.string().nullable().optional(),
  season: z.number().int("Must be a whole number").min(0).nullable().optional(),
  episode: z.number().int("Must be a whole number").min(0).nullable().optional(),
  score: z.number().min(0).max(10, "Score is out of 10").nullable().optional(),
  release: z.string().nullable().optional(),
  poster: z.union([z.literal(""), z.url({ error: "Must be a valid URL", protocol: /^https?$/ })]).nullable().optional(),
});

export type TCinemaTvValues = z.infer<typeof SCinemaTvValues>;
export type TCinemaTvInput = z.input<typeof SCinemaTvInput>;
