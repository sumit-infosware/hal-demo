import { Router } from "express";
import { liveness, readiness } from "../controllers/health.controller.js";

export const healthRouter = Router();
healthRouter.get("/health/live", liveness);
healthRouter.get("/health/ready", readiness);
