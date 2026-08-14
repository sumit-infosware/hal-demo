import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const prisma = new PrismaClient({
  log: env.isDev
    ? [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
      ]
    : [{ emit: "event", level: "error" }],
});

if (env.isDev) {
  prisma.$on("query", (e: any) => {
    logger.debug({ query: e.query, duration: e.duration }, "prisma:query");
  });
}
