import { NextFunction, Request, Response } from "express";
import { success } from "../http/ApiResponse.js";
import { authService } from "../services/auth.service.js";

const { register, login } = authService;

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    const user = await register(data);
    success(res, user, 201, req.requestId);
  } catch (e) {
    next(e);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body as { email: string; password: string };
    const result = await login(data);
    success(res, result, 200, req.requestId);
  } catch (e) {
    next(e);
  }
};
