/**
 * Central registry of system role names.
 *
 * Single source of truth for role names used across the application.
 * These names map directly to the `Role.name` column in the database
 * (which is unique). The seed and RBAC logic reference these constants
 * rather than hardcoding strings.
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

/** Type representing every known role name. */
export type RoleName = (typeof ROLES)[keyof typeof ROLES];
