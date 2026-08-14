import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";

const { register } = authService;

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = req.body as { email: string; password: string; firstName: string; lastName: string };
    res.status(201).json({ success: true, data: await register(b) });
  } catch (e) {
    next(e);
  }
};
