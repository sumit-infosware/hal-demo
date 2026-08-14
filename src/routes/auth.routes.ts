import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerUser);

// authRouter.post("/login",)

// authRouter.post("/refresh",)

// authRouter.post("/logout",)

// authRouter.get("/me",)
