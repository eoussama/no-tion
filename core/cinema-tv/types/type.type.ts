import type { TYPES } from "../consts";



export type TType = typeof TYPES[keyof typeof TYPES];
