import { Document } from "mongoose";
import { UserRole } from "../types/UserRole";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  mobilePhone?: string;
  externalId?: string;
  creationDate: Date;
  lastLogin?: Date;
  isActive: boolean;
}
