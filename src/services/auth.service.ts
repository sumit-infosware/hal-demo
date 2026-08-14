import { AuthenticationError, ConflictError } from "../errors/errors.js";
import { authHelper } from "../helpers/auth.helper.js";
import { authRepository } from "../repositories/auth.repository.js";

const { findUserByEmail, createUser, updateLastLogin } = authRepository;
const { encryptPassword, verifyPassword, generateAccessToken, generateRefreshToken } = authHelper;

function toSafeUser(user: { id: string; email: string; firstName: string; lastName: string }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const email = data.email.toLowerCase();
    if (await findUserByEmail(email)) {
      throw new ConflictError("Email already registered");
    }
    const passwordHash = await encryptPassword(data.password);
    const user = await createUser({
      email: data.email,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    return toSafeUser(user);
  },

  login: async (data: { email: string; password: string }) => {
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
    const accessToken = await generateAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await generateRefreshToken({
      sub: user.id,
      email: user.email,
      jti: crypto.randomUUID(),
    });
    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
    };
  },
};
