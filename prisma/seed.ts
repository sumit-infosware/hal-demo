import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  console.log(" Starting database seed...");

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with standard access",
      isSystem: true,
    },
  });

  console.log(" Roles created:", { admin: adminRole.name, user: userRole.name });

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: "users.read" },
      update: {},
      create: { code: "users.read", description: "Read user information" },
    }),
    prisma.permission.upsert({
      where: { code: "users.write" },
      update: {},
      create: { code: "users.write", description: "Create and update users" },
    }),
    prisma.permission.upsert({
      where: { code: "users.delete" },
      update: {},
      create: { code: "users.delete", description: "Delete users" },
    }),
    prisma.permission.upsert({
      where: { code: "admin.access" },
      update: {},
      create: { code: "admin.access", description: "Access admin panel" },
    }),
  ]);

  console.log(
    " Permissions created:",
    permissions.map((p) => p.code),
  );

  // Assign permissions to roles
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissions[0].id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: permissions[0].id },
  });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissions[1].id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: permissions[1].id },
  });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissions[2].id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: permissions[2].id },
  });
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissions[3].id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: permissions[3].id },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: userRole.id, permissionId: permissions[0].id } },
    update: {},
    create: { roleId: userRole.id, permissionId: permissions[0].id },
  });

  console.log(" Role permissions assigned");

  // Hash passwords
  const saltRounds = 12;
  const adminPasswordHash = await bcrypt.hash("Admin@123", saltRounds);
  const userPasswordHash = await bcrypt.hash("User@123", saltRounds);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPasswordHash,
      firstName: "Admin",
      lastName: "User",
      isActive: true,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPasswordHash,
      firstName: "Regular",
      lastName: "User",
      isActive: true,
    },
  });

  console.log(" Users created:", { admin: adminUser.email, user: regularUser.email });

  // Assign roles to users
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: regularUser.id, roleId: userRole.id } },
    update: {},
    create: { userId: regularUser.id, roleId: userRole.id },
  });

  console.log(" User roles assigned");

  console.log("\n Seed completed successfully!");
  console.log("\n Test Credentials:");
  console.log("────────────────────────────────────────────────");
  console.log("│ Role        │ Email                │ Password    │");
  console.log("├────────────────────────────────────────────────");
  console.log("│ Admin       │ admin@example.com    │ Admin@123   │");
  console.log("│ User        │ user@example.com     │ User@123    │");
  console.log("────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(" Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
