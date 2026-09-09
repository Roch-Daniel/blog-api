import "../config/zod";
import { z } from "zod";

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
  password: z
    .string()
    .min(8, "A senha precisa ter no mínimo 8 caracteres")
    .regex(/[A-Za-z]/, "A senha precisa conter ao menos uma letra")
    .regex(/[0-9]/, "A senha precisa conter ao menos um número"),
  email: z.email({ message: "Email inválido" }).trim(),
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
