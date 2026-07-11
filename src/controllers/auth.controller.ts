import { NextFunction, Request, Response } from "express";
import { login } from "../services/auth.services";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};
