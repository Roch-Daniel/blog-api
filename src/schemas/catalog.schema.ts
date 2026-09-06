import "../config/zod";
import { z } from "zod";
import { USER_ROLES } from "../constants/roles.constant";

export const createDisciplineSchema = z.object({
  label: z.string().trim().min(1, "Campo obrigatório não informado: label"),
  order: z.number({ error: "Campo obrigatório não informado: order" }),
  isActive: z.boolean().optional().default(true),
});

export const createStatusSchema = z.object({
  label: z.string().trim().min(1, "Campo obrigatório não informado: label"),
  order: z.number({ error: "Campo obrigatório não informado: order" }),
  isActive: z.boolean().optional().default(true),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Campo obrigatório não informado: name"),
  username: z
    .string()
    .trim()
    .min(1, "Campo obrigatório não informado: username"),
  password: z.string().min(1, "Campo obrigatório não informado: password"),
  email: z.email({ message: "Email inválido" }).trim(),
  role: z
    .enum(USER_ROLES, {
      message: "Role inválido. Valores permitidos: PROFESSOR, ALUNO",
    })
    .optional()
    .default("ALUNO"),
  mobilePhone: z.string().trim().optional(),
  externalId: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();
export const updateStatusSchema = createStatusSchema.partial();
export const updateUserSchema = createUserSchema.partial();

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
