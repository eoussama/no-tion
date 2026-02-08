import { z } from "zod";



export const SLoginForm = z.object({
  password: z.string().min(1, "Password is required"),
});
