import { z } from "zod";



export const SLoginRequest = z.object({
  password: z.string().min(1, "Password is required"),
});

export const SAuthStatusResponse = z.object({
  authenticated: z.boolean(),
});

export type TAuthStatusResponse = z.infer<typeof SAuthStatusResponse>;
