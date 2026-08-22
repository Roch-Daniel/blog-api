import { Router } from "express";
import {
  listUsers,
  storeUser,
  updateUserById,
  removeUser,
  listDisciplines,
  storeDiscipline,
  updateDisciplineById,
  removeDiscipline,
  listStatuses,
  storeStatus,
  updateStatusById,
  removeStatus,
} from "../controllers/catalog.controller";
import { requireProfessor } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createDisciplineSchema,
  createStatusSchema,
  createUserSchema,
  updateDisciplineSchema,
  updateStatusSchema,
  updateUserSchema,
} from "../schemas/catalog.schema";

// Bloco: rotas auxiliares para consultar catálogos usados no cadastro de posts.

const catalogRoutes = Router();

// ── Usuários ──────────────────────────────────────────────────────────────────
catalogRoutes.get("/users", requireProfessor, listUsers);
catalogRoutes.post(
  "/users",
  requireProfessor,
  validate(createUserSchema),
  storeUser,
);
catalogRoutes.put(
  "/users/:id",
  requireProfessor,
  validate(updateUserSchema),
  updateUserById,
);
catalogRoutes.delete("/users/:id", requireProfessor, removeUser);

// ── Disciplinas ───────────────────────────────────────────────────────────────
catalogRoutes.get("/disciplines", listDisciplines);
catalogRoutes.post(
  "/disciplines",
  requireProfessor,
  validate(createDisciplineSchema),
  storeDiscipline,
);
catalogRoutes.put(
  "/disciplines/:id",
  requireProfessor,
  validate(updateDisciplineSchema),
  updateDisciplineById,
);
catalogRoutes.delete("/disciplines/:id", requireProfessor, removeDiscipline);

// ── Status ────────────────────────────────────────────────────────────────────
catalogRoutes.get("/status", listStatuses);
catalogRoutes.post(
  "/status",
  requireProfessor,
  validate(createStatusSchema),
  storeStatus,
);
catalogRoutes.put(
  "/status/:id",
  requireProfessor,
  validate(updateStatusSchema),
  updateStatusById,
);
catalogRoutes.delete("/status/:id", requireProfessor, removeStatus);

export default catalogRoutes;
