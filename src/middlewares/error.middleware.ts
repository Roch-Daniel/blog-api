import { Request, Response, NextFunction } from "express";
import IAppError from "../interfaces/IAppError";

const errorMiddleware = (
  err: IAppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status || 500;

  const message = err.message || "Erro interno do servidor";

  console.error(`[ERRO] ${status} - ${message}`);

  res.status(status).json({
    status,
    message,
  });
};

export default errorMiddleware;
