import { createServer } from "node:http";
import { createApp } from "./app.js";
import { prisma } from "./config/clients.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

function main(): void {
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "server:listening");
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "shutdown:start");
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect().catch(() => void 0);
    logger.info({ signal }, "shutdown:complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("uncaughtException", (e) => {
    logger.fatal({ err: e instanceof Error ? e.message : "unknown" }, "uncaughtException");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.fatal(
      { err: reason instanceof Error ? reason.message : String(reason) },
      "unhandledRejection",
    );
  });
}

void main();
