/**
 * Central registry of permission codes.
 *
 * Single source of truth for every permission string used across the
 * application. Permission codes follow the existing `resource.action`
 * convention already established in the seed (e.g. `users.read`,
 * `admin.access`). Controllers, services, routes and middleware must
 * reference these constants rather than hardcoding strings.
 */
export const PERMISSIONS = {
  // Role management
  ROLE_CREATE: "roles.create",
  ROLE_READ: "roles.read",
  ROLE_UPDATE: "roles.update",
  ROLE_DELETE: "roles.delete",

  // Permission management
  PERMISSION_CREATE: "permissions.create",
  PERMISSION_READ: "permissions.read",
  PERMISSION_UPDATE: "permissions.update",
  PERMISSION_DELETE: "permissions.delete",

  // Existing application-level permission (seeded by the original seed).
  ADMIN_ACCESS: "admin.access",
} as const;

/** Type representing every valid permission code. */
export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Array form of every permission code (useful for seeding/admin grants). */
export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);
