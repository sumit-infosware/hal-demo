import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const authHelper = {
  encryptPassword: (password: string) => bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS),
};
