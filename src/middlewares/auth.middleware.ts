import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/users.model";

const PROFESSOR_DOMAIN = "@professor.com";

export const requireProfessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: 401, message: "Token de autenticação não informado" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurada.");
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, secret) as JwtPayload;
  } catch {
    res.status(401).json({ status: 401, message: "Token inválido ou expirado" });
    return;
  }

  const user = await UserModel.findById(payload.id);

  if (!user || !user.isActive) {
    res.status(401).json({ status: 401, message: "Usuário não encontrado ou inativo" });
    return;
  }

  if (!user.email.endsWith(PROFESSOR_DOMAIN)) {
    res.status(403).json({ status: 403, message: `Acesso restrito a usuários com domínio ${PROFESSOR_DOMAIN}` });
    return;
  }

  req.user = user;
  next();
};
