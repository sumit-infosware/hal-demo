import { Router } from "express";
import { healthRouter } from "./health.routes.js";

export const appRouter = Router();
appRouter.use(healthRouter);
