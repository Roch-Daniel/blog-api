import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/IUser";
import { USER_ROLES } from "../constants/roles.constant";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobilePhone: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
    creationDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
      default: "ALUNO",
    },
  },
  {
    versionKey: false,
  },
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
