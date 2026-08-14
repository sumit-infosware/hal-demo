import { z } from "zod";



export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
});
