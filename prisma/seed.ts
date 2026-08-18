import { prisma } from "../src/config/clients.js";
import { PERMISSIONS } from "../src/constants/permissions.js";
import { ROLES } from "../src/constants/roles.js";
import { authHelper } from "../src/helpers/auth.helper.js";

async function main() {
  // ─── Permissions ─────────────────────────────────────────────
  // Idempotent: upsert by unique `code` so the seed is safe to run repeatedly.
  const permissionDefs: { code: string; description: string }[] = [
    { code: PERMISSIONS.USER_READ, description: "Allows reading user records" },
    { code: PERMISSIONS.USER_CREATE, description: "Allows creating user records" },
    { code: PERMISSIONS.USER_UPDATE, description: "Allows updating user records" },
    { code: PERMISSIONS.USER_DELETE, description: "Allows deleting user records" },
    { code: PERMISSIONS.ADMIN_ACCESS, description: "Grants access to admin-only operations" },
    { code: PERMISSIONS.ROLE_CREATE, description: "Allows creating roles" },
    { code: PERMISSIONS.ROLE_READ, description: "Allows reading roles" },
    { code: PERMISSIONS.ROLE_UPDATE, description: "Allows updating roles" },
    { code: PERMISSIONS.ROLE_DELETE, description: "Allows deleting roles" },
    { code: PERMISSIONS.PERMISSION_CREATE, description: "Allows creating permissions" },
    { code: PERMISSIONS.PERMISSION_READ, description: "Allows reading permissions" },
    { code: PERMISSIONS.PERMISSION_UPDATE, description: "Allows updating permissions" },
    { code: PERMISSIONS.PERMISSION_DELETE, description: "Allows deleting permissions" },
  ];

  for (const def of permissionDefs) {
    await prisma.permission.upsert({
      where: { code: def.code },
      update: { description: def.description },
      create: def,
    });
  }

  // ─── Roles ───────────────────────────────────────────────────
  // Two roles are seeded: an admin with full access and a standard
  // user with read-only access. Both are marked as system roles so
  // they cannot be renamed or deleted through the CRUD endpoints.
  const adminRole = await prisma.role.upsert({
    where: { name: ROLES.ADMIN },
    update: {},
    create: { name: ROLES.ADMIN, description: "Administrator with full access", isSystem: true },
  });

  const userRole = await prisma.role.upsert({
    where: { name: ROLES.USER },
    update: {},
    create: {
      name: ROLES.USER,
      description: "Standard authenticated user with read-only access",
      isSystem: true,
    },
  });

  // ─── Role ↔ Permission assignments ──────────────────────────
  // Admin receives EVERY permission defined in the system (full access).
  const allPermissions = await prisma.permission.findMany({ select: { id: true } });
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p: { id: string }) => ({ roleId: adminRole.id, permissionId: p.id })),
  });

  // User receives ONLY read permissions (any code ending in ".read").
  const userPermissions = await prisma.permission.findMany({
    where: { code: { endsWith: ".read" } },
    select: { id: true },
  });
  await prisma.rolePermission.deleteMany({ where: { roleId: userRole.id } });
  await prisma.rolePermission.createMany({
    data: userPermissions.map((p: { id: string }) => ({ roleId: userRole.id, permissionId: p.id })),
  });

  // ─── Users ───────────────────────────────────────────────────
  // Two demo accounts are seeded so the RBAC flow can be exercised:
  //   • user1 → admin role  (full access to every permission)
  //   • user2 → user  role  (read-only access)
  // Passwords are hashed with the project's bcrypt helper. Upserted
  // by unique email so the seed is safe to run repeatedly.
  const usersToSeed = [
    {
      email: "admin@gmail.com",
      password: "Admin@1234",
      firstName: "Admin",
      lastName: "User",
      roleId: adminRole.id,
    },
    {
      email: "user@gmail.com",
      password: "User@1234",
      firstName: "Readonly",
      lastName: "User",
      roleId: userRole.id,
    },
  ];

  for (const u of usersToSeed) {
    const passwordHash = await authHelper.encryptPassword(u.password);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: passwordHash, firstName: u.firstName, lastName: u.lastName },
      create: {
        email: u.email,
        password: passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });

    // Assign the role (idempotent: delete existing links, then recreate).
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: u.roleId } });
  }

  console.log("Seed complete: roles, permissions and users upserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
