import cookieParser from "cookie-parser";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { csrfProtection, errorHandler, notFound } from "./middleware/http.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { applySecurity } from "./middleware/security.middleware.js";
import { appRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  applySecurity(app);
  app.use(requestIdMiddleware);
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(csrfProtection);
  app.use("/api/v1", appRouter);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
