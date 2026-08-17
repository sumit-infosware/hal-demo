import { NextFunction, Request, Response } from "express";
import { success } from "../http/ApiResponse.js";
import { rbacService } from "../services/rbac.service.js";

const { listRoles, listPermissions } = rbacService;

export const listRolesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roles = await listRoles();
    success(res, roles, 200, _req.requestId);
  } catch (e) {
    next(e);
  }
};

export const listPermissionsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const permissions = await listPermissions();
    success(res, permissions, 200, _req.requestId);
  } catch (e) {
    next(e);
  }
};
