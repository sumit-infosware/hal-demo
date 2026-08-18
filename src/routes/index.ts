//for the end point

import { Router } from "express";
import auditRouter from "./audit.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import rbacRouter from "./rbac.routes.js";
import userRouter from "./user.routes.js";

export const appRouter = Router();
appRouter.use(healthRouter);
appRouter.use("/auth", authRouter);
appRouter.use("/rbac", rbacRouter);
appRouter.use("/users", userRouter);
appRouter.use("/audit", auditRouter);
