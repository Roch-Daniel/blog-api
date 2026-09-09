import { Document } from "mongoose";
import { RoleUsers } from "../types/UserRole";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  email: string;
  role: RoleUsers;
  mobilePhone?: string;
  externalId?: string;
  creationDate: Date;
  lastLogin?: Date;
  isActive: boolean;
}
