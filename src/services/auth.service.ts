import { ConflictError } from "../errors/errors.js";
import { authHelper } from "../helpers/auth.helper.js";
import { authRepository } from "../repositories/auth.repository.js";

const { findUserByEmail, createUser } = authRepository;
const { encryptPassword } = authHelper;

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
    // const role = await prisma.role.findUnique({ where: { name: DEFAULT_USER_ROLE } });
    // if (role) {
    //   await prisma.userRole
    //     .create({ data: { userId: user.id, roleId: role.id } })
    //     .catch(() => void 0);
    // }
    // return getAccount(user.id);
    return user;
  },
};
