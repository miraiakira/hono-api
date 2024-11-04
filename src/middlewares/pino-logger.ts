import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import { PinoPretty } from "pino-pretty";

import env from "@/env";

export function pinoLogger() {
  return logger({
    pino: pino({ level: env.LOG_LEVEL || "info" }, env.NODE_ENV === "production"
      ? undefined
      : PinoPretty({
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      })),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
