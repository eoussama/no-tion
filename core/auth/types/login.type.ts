import type z from "zod";
import type { SLoginForm } from "../schemas";



export type TLogin = z.infer<typeof SLoginForm>;
