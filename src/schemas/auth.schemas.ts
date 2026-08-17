import { z } from "zod";

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
});

// Refresh token may be supplied in the request body or via httpOnly cookie.
// The body field is optional; the controller falls back to the cookie.
export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional();

// Logout is idempotent; refresh token is optional (cookie or body).
export const logoutSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional();
