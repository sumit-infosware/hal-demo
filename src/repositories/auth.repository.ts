import { prisma } from "../config/clients.js";

export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
    }),

  createUser: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    prisma.user.create({
      data: userData,
    }),
};
