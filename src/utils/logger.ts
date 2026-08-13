import { join } from "node:path";
import pino from "pino";
import { env } from "../config/env.js";

const logFile = join(process.cwd(), "logs", "app.log");

function buildLogger() {
  return pino({
    level: env.LOG_LEVEL,

    transport: {
      targets: [
        // Always write logs to file
        {
          target: "pino/file",
          level: env.LOG_LEVEL,
          options: {
            destination: logFile,
            mkdir: true,
          },
        },

        // Pretty logs in development
        ...(env.isDev
          ? [
              {
                target: "pino-pretty",
                level: env.LOG_LEVEL,
                options: {
                  colorize: true,
                  translateTime: "SYS:HH:MM:ss",
                  ignore: "pid,hostname",
                },
              },
            ]
          : []),
      ],
    },

    redact: {
      paths: [
        "authorization",
        "cookie",
        "password",
        "token",
        "accessToken",
        "refreshToken",
        "secret",
        "*.password",
        "req.headers.authorization",
        "req.headers.cookie",
      ],
      censor: "[REDACTED]",
    },
  });
}

export const logger = buildLogger();
