import type { Prisma } from "../../prisma/generated/prisma/client.js";
import { prisma } from "../config/clients.js";

export interface AuditQuery {
  actorId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export const auditRepository = {
  /**
   * Returns a paginated list of audit logs ordered by most recent first.
   */
  list: async (query: AuditQuery = {}) => {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(100, query.limit ?? 20));
    const where: Prisma.AuditLogWhereInput = {};
    if (query.actorId) where.userId = query.actorId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = query.from;
      if (query.to) where.createdAt.lte = query.to;
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
