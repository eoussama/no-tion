import { z } from "zod";
import { DATABASE_IDS } from "../consts";



export const SDatabaseId = z
  .string()
  .regex(
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i,
    "Invalid database ID",
  )
  .refine(
    (val): val is (typeof DATABASE_IDS)[keyof typeof DATABASE_IDS] =>
      (Object.values(DATABASE_IDS) as string[]).includes(val),
    "Database ID is not allowed",
  );

export type TDatabaseId = z.infer<typeof SDatabaseId>;
