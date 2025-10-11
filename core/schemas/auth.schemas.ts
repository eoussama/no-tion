import { z } from "zod";



export const loginRequestSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const authStatusResponseSchema = z.object({
  authenticated: z.boolean(),
});

export type TAuthStatusResponse = z.infer<typeof authStatusResponseSchema>;
