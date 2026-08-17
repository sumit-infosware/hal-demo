import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors/errors.js";
import { success } from "../http/ApiResponse.js";
import { authService } from "../services/auth.service.js";

const { listUsers, getUserById, assignRole } = authService;

export const listUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await listUsers({ page, limit });
    success(res, result, 200, req.requestId);
  } catch (e) {
    next(e);
  }
};

export const getUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const user = await getUserById(id);
    success(res, user, 200, req.requestId);
  } catch (e) {
    next(e);
  }
};

export const assignRoleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: unknown };
    if (typeof role !== "string" || role.trim().length === 0) {
      throw new ValidationError("Role name is required");
    }
    const result = await assignRole(id, role.trim());
    success(res, result, 200, req.requestId);
  } catch (e) {
    next(e);
  }
};
