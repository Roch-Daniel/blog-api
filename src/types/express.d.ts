import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: Document & {
        email: string;
        isActive: boolean;
        name: string;
        username: string;
        _id: unknown;
      };
    }
  }
}
