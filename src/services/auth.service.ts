import { AuthenticationError, NotFoundError } from "../errors/errors.js";
import { authHelper } from "../helpers/auth.helper.js";
import { authRepository } from "../repositories/auth.repository.js";
import { rbacService } from "./rbac.service.js";

const {
  findUserByEmail,
  updateLastLogin,
  createSession,
  findSessionByJti,
  revokeSession,
  revokeSessionFamily,
  findUserById,
  listUsers,
  countUsers,
  hashToken,
} = authRepository;
const { verifyPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } =
  authHelper;

function toSafeUser(user: { id: string; email: string; firstName: string; lastName: string }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

const REFRESH_TOKEN_EXPIRY_DEFAULT = "7d";

function parseExpiry(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1]!, 10);
  const unit = match[2]! as "s" | "m" | "h" | "d";
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * (multipliers[unit] ?? 1));
}

export const authService = {
  login: async (data: { email: string; password: string; userAgent?: string; ip?: string }) => {
    const email = data.email.toLowerCase();
    const user = await findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }
    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }
    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }
    await updateLastLogin(user.id);
    const jti = crypto.randomUUID();
    const familyId = crypto.randomUUID();
    const accessToken = await generateAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await generateRefreshToken({
      sub: user.id,
      email: user.email,
      jti,
    });
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN ?? REFRESH_TOKEN_EXPIRY_DEFAULT;
    const expiresAt = parseExpiry(refreshExpiresIn);
    await createSession({
      userId: user.id,
      familyId,
      tokenHash: hashToken(refreshToken),
      jti,
      userAgent: data.userAgent,
      ip: data.ip,
      expiresAt,
    });
    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
    };
  },

  refreshToken: async (refreshToken: string, userAgent?: string, ip?: string) => {
    if (!refreshToken) {
      throw new AuthenticationError("Refresh token is required");
    }
    const { payload } = await verifyRefreshToken(refreshToken);
    const { jti } = payload as { sub: string; jti: string };
    if (!jti) {
      throw new AuthenticationError("Invalid refresh token");
    }
    const session = await findSessionByJti(jti);
    if (!session) {
      throw new AuthenticationError("Refresh token not found");
    }
    if (session.revokedAt) {
      // Token reuse detected — revoke entire family
      await revokeSessionFamily(session.familyId);
      throw new AuthenticationError("Refresh token has been revoked");
    }
    if (session.expiresAt < new Date()) {
      throw new AuthenticationError("Refresh token has expired");
    }
    const user = await findUserByEmail(payload.email as string);
    if (!user || !user.isActive) {
      throw new AuthenticationError("User not found or deactivated");
    }
    // Rotate: revoke current, create new
    const newJti = crypto.randomUUID();
    const newRefreshToken = await generateRefreshToken({
      sub: user.id,
      email: user.email,
      jti: newJti,
    });
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN ?? REFRESH_TOKEN_EXPIRY_DEFAULT;
    const newExpiresAt = parseExpiry(refreshExpiresIn);
    await revokeSession(session.id, newJti);
    await createSession({
      userId: user.id,
      familyId: session.familyId,
      tokenHash: hashToken(newRefreshToken),
      jti: newJti,
      userAgent,
      ip,
      expiresAt: newExpiresAt,
    });
    const newAccessToken = await generateAccessToken({ sub: user.id, email: user.email });
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  logout: async (refreshToken: string) => {
    if (!refreshToken) {
      // Idempotent: no token provided, nothing to do
      return;
    }
    try {
      const { payload } = await verifyRefreshToken(refreshToken);
      const { jti } = payload as { jti: string };
      if (jti) {
        const session = await findSessionByJti(jti);
        if (session && !session.revokedAt) {
          await revokeSession(session.id);
        }
      }
    } catch {
      // Invalid/expired token — idempotent logout, ignore
    }
  },

  logoutAll: async (userId: string) => {
    await authRepository.revokeAllUserSessions(userId);
  },

  // ─── User / account management ──────────────────────────────
  listUsers: async (options: { page: number; limit: number }) => {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const [items, total] = await Promise.all([
      listUsers({ skip: (page - 1) * limit, take: limit }),
      countUsers(),
    ]);
    return {
      users: items.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        roles: u.roles.map((r) => r.role.name),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getUserById: async (id: string) => {
    const user = await findUserById(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map((r) => r.role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Assigns a single role to a user (replacing any existing roles).
   * Authorization (role.update permission) is enforced at the route layer.
   */
  assignRole: async (userId: string, roleName: string) => {
    const user = await findUserById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return rbacService.assignRole(userId, roleName);
  },
};
