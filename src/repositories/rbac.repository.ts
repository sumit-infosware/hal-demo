import { prisma } from "../config/clients.js";

/**
 * RBAC data access.
 * Reuses the existing Prisma models: User, Role, Permission, UserRole, RolePermission.
 * Permissions are resolved from the database (never trusted from the client or JWT).
 */
export const rbacRepository = {
  /** Loads a user together with their role(s) and each role's permissions. */
  findUserWithAccess: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: {
                    permission: { select: { code: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),

  findRoleByName: (name: string) =>
    prisma.role.findUnique({
      where: { name },
      select: { id: true, name: true },
    }),

  listRoles: () =>
    prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        permissions: {
          select: { permission: { select: { code: true, description: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),

  listPermissions: () =>
    prisma.permission.findMany({
      select: { id: true, code: true, description: true },
      orderBy: { code: "asc" },
    }),

  /**
   * Replaces a user's roles with a single role, enforcing the "exactly one role"
   * invariant at the application layer (the schema join is many-to-many).
   */
  assignRole: async (userId: string, roleId: string) =>
    prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      return tx.userRole.create({ data: { userId, roleId } });
    }),
};
