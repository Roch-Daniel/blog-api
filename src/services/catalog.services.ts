import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import DisciplineModel from "../models/disciplines.model";
import StatusModel from "../models/status.model";
import UserModel from "../models/users.model";
import IAppError from "../interfaces/IAppError";
import {
  getMemoryDisciplines,
  getMemoryStatuses,
  getMemoryUsers,
} from "./memory-data.service";
import {
  CreateDisciplineInput,
  CreateStatusInput,
  CreateUserInput,
} from "../schemas/catalog.schema";

const isMemoryMode = (): boolean => process.env.USE_IN_MEMORY_DB === "true";

const createAppError = (message: string, status: number): IAppError => {
  const error = new Error(message) as IAppError;
  error.status = status;
  return error;
};

const validateObjectId = (value: string, fieldName: string): void => {
  if (!isValidObjectId(value)) {
    throw createAppError(`${fieldName} inválido`, 400);
  }
};

const toUserResponse = (user: InstanceType<typeof UserModel>) => {
  const { password: _password, ...safeUser } = user.toObject();
  return safeUser;
};

// ─────────────────────────────── Usuários ────────────────────────────────────

export const getAllUsers = async () => {
  if (isMemoryMode()) {
    return getMemoryUsers();
  }

  return UserModel.find(
    {},
    { name: 1, username: 1, email: 1, role: 1, isActive: 1 },
  ).sort({ name: 1 });
};

export const createUser = async (payload: CreateUserInput) => {
  const existing = await UserModel.findOne({
    $or: [{ email: payload.email }, { username: payload.username }],
  });

  if (existing) {
    throw createAppError("Email ou username já cadastrado", 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UserModel.create({ ...payload, password: hashedPassword });

  return toUserResponse(user);
};

export const updateUser = async (
  id: string,
  payload: Partial<CreateUserInput>,
) => {
  validateObjectId(id, "id");

  const user = await UserModel.findById(id);

  if (!user) {
    throw createAppError("Usuário não encontrado", 404);
  }

  if (payload.email !== undefined || payload.username !== undefined) {
    const duplicateFilters = [];

    if (payload.email !== undefined) {
      duplicateFilters.push({ email: payload.email });
    }
    if (payload.username !== undefined) {
      duplicateFilters.push({ username: payload.username });
    }

    const existing = await UserModel.findOne({
      _id: { $ne: id },
      $or: duplicateFilters,
    });

    if (existing) {
      throw createAppError("Email ou username já cadastrado", 409);
    }
  }

  if (payload.name !== undefined) {
    user.name = payload.name;
  }
  if (payload.username !== undefined) {
    user.username = payload.username;
  }
  if (payload.password !== undefined) {
    user.password = await bcrypt.hash(payload.password, 10);
  }
  if (payload.email !== undefined) {
    user.email = payload.email;
  }
  if (payload.role !== undefined) {
    user.role = payload.role;
  }
  if (payload.isActive !== undefined) {
    user.isActive = payload.isActive;
  }

  await user.save();

  return toUserResponse(user);
};

export const deleteUser = async (id: string) => {
  validateObjectId(id, "id");

  const user = await UserModel.findByIdAndDelete(id);

  if (!user) {
    throw createAppError("Usuário não encontrado", 404);
  }
};

// ───────────────────────── Disciplinas ────────────────────────────────────────

export const getAllDisciplines = async () => {
  if (isMemoryMode()) {
    return getMemoryDisciplines();
  }

  return DisciplineModel.find().sort({ order: 1, label: 1 });
};

export const createDiscipline = async (payload: CreateDisciplineInput) => {
  const existing = await DisciplineModel.findOne({ label: payload.label });

  if (existing) {
    throw createAppError("Disciplina já cadastrada", 409);
  }

  return DisciplineModel.create(payload);
};

export const updateDiscipline = async (
  id: string,
  payload: Partial<CreateDisciplineInput>,
) => {
  validateObjectId(id, "id");

  const discipline = await DisciplineModel.findById(id);

  if (!discipline) {
    throw createAppError("Disciplina não encontrada", 404);
  }

  if (payload.label !== undefined) {
    discipline.label = payload.label;
  }
  if (payload.order !== undefined) {
    discipline.order = payload.order;
  }
  if (payload.isActive !== undefined) {
    discipline.isActive = payload.isActive;
  }

  await discipline.save();

  return discipline;
};

export const deleteDiscipline = async (id: string) => {
  validateObjectId(id, "id");

  const discipline = await DisciplineModel.findByIdAndDelete(id);

  if (!discipline) {
    throw createAppError("Disciplina não encontrada", 404);
  }
};

// ─────────────────────────────── Status ────────────────────────────────────────

export const getAllStatuses = async () => {
  if (isMemoryMode()) {
    return getMemoryStatuses();
  }

  return StatusModel.find().sort({ order: 1, label: 1 });
};

export const createStatus = async (payload: CreateStatusInput) => {
  const existing = await StatusModel.findOne({ label: payload.label });

  if (existing) {
    throw createAppError("Status já cadastrado", 409);
  }

  return StatusModel.create(payload);
};

export const updateStatus = async (
  id: string,
  payload: Partial<CreateStatusInput>,
) => {
  validateObjectId(id, "id");

  const status = await StatusModel.findById(id);

  if (!status) {
    throw createAppError("Status não encontrado", 404);
  }

  if (payload.label !== undefined) {
    status.label = payload.label;
  }
  if (payload.order !== undefined) {
    status.order = payload.order;
  }
  if (payload.isActive !== undefined) {
    status.isActive = payload.isActive;
  }

  await status.save();

  return status;
};

export const deleteStatus = async (id: string) => {
  validateObjectId(id, "id");

  const status = await StatusModel.findByIdAndDelete(id);

  if (!status) {
    throw createAppError("Status não encontrado", 404);
  }
};
