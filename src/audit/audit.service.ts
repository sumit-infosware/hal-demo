import type { Prisma } from "../../prisma/generated/prisma/client.js";
import { prisma } from "../config/clients.js";
import { logger } from "../config/logger.js";
import type { AuditContext, AuditOptions } from "./audit.types.js";

/**
 * Persists an audit record. Failures are swallowed (logged at error level)
 * so that auditing never breaks the primary business operation.
 */
export async function writeAudit(ctx: AuditContext | undefined, opts: AuditOptions): Promise<void> {
  const meta: Record<string, unknown> = {
    requestId: ctx?.requestId,
    actorEmail: ctx?.actorEmail,
    ...(opts.meta ?? {}),
  };

  try {
    await prisma.auditLog.create({
      data: {
        userId: ctx?.actorId ?? null,
        action: opts.action,
        resource: opts.resource,
        resourceId: opts.resourceId ?? null,
        ip: ctx?.ip ?? null,
        userAgent: ctx?.userAgent ?? null,
        metadata: meta as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    logger.error(
      { err, action: opts.action, resource: opts.resource, requestId: ctx?.requestId },
      "audit: failed to persist audit record",
    );
  }
}
