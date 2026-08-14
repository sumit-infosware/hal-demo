//for the end point

import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";

export const appRouter = Router();
appRouter.use(healthRouter);
appRouter.use("/auth", authRouter);
