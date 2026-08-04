import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/users.model";
import IAppError from "../interfaces/IAppError";

const createAppError = (message: string, status: number): IAppError => {
  const error = new Error(message) as IAppError;
  error.status = status;
  return error;
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw createAppError("Email e senha são obrigatórios", 400);
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user || !user.isActive) {
    throw createAppError("Credenciais inválidas", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw createAppError("Credenciais inválidas", 401);
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurada.");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    secret,
    { expiresIn: "8h" },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};
