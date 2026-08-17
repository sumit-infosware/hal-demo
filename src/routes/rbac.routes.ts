import { Router } from "express";
import { listPermissionsHandler, listRolesHandler } from "../controllers/rbac.controller.js";
import { authenticate, requirePermission } from "../helpers/rbac.helper.js";

const router = Router();

// Listing roles/permissions requires an authenticated caller with `role.read`.
router.use(authenticate);
router.get("/", requirePermission("role.read"), listRolesHandler);
router.get("/permissions", requirePermission("role.read"), listPermissionsHandler);

export default router;
