import type { GENRES } from "../consts/genres.const";



export type TGenre = typeof GENRES[keyof typeof GENRES];
