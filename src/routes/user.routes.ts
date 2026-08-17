import { Router } from "express";
import {
  assignRoleHandler,
  getUserHandler,
  listUsersHandler,
} from "../controllers/user.controller.js";
import { authenticate, requirePermission } from "../helpers/rbac.helper.js";

const router = Router();

// All user-management endpoints require an authenticated caller.
router.use(authenticate);

// List users — requires the `user.read` permission.
router.get("/", requirePermission("user.read"), listUsersHandler);

// Get a single user — requires the `user.read` permission.
router.get("/:id", requirePermission("user.read"), getUserHandler);

// Assign a role to a user — requires the `role.update` permission.
router.post("/:id/role", requirePermission("role.update"), assignRoleHandler);

export default router;
