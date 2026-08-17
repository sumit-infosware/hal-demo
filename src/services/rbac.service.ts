import { AuthenticationError, NotFoundError } from "../errors/errors.js";
import { rbacRepository } from "../repositories/rbac.repository.js";

/**
 * RBAC service.
 * Resolves a user's single role and that role's permissions from the database
 * on every authorization check, so stale JWTs cannot grant elevated privileges.
 */
export const rbacService = {
  /** Resolves the authenticated user's role and permissions from the database. */
  resolveAccess: async (userId: string) => {
    const user = await rbacRepository.findUserWithAccess(userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = new Set<string>();
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.code);
      }
    }
    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions: [...permissions],
    };
  },

  /** Returns true when the user holds every required permission. */
  hasPermissions: (userPermissions: string[], required: string[]): boolean =>
    required.every((p) => userPermissions.includes(p)),

  /** Returns true when the user holds at least one of the required permissions. */
  hasAnyPermission: (userPermissions: string[], required: string[]): boolean =>
    required.some((p) => userPermissions.includes(p)),

  listRoles: async () => rbacRepository.listRoles(),

  listPermissions: async () => rbacRepository.listPermissions(),

  /**
   * Assigns a single role to a user, replacing any existing roles.
   * Protected by the `role.update` permission at the route layer.
   */
  assignRole: async (userId: string, roleName: string) => {
    const role = await rbacRepository.findRoleByName(roleName);
    if (!role) {
      throw new NotFoundError("Role");
    }
    await rbacRepository.assignRole(userId, role.id);
    return { userId, role: role.name };
  },
};
