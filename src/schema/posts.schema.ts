import { z } from "zod";

// ---------------------------------------------------
// CREATE POST SCHEMA
// Validação para criação de posts
// ---------------------------------------------------

export const createPostSchema = z.object({
  // ---------------------------------------------------
  // title
  // string obrigatória
  // mínimo 5 caracteres
  // máximo 100 caracteres
  // ---------------------------------------------------
  title: z
    .string({
      error: "Title deve ser uma string",
    })
    .trim()
    .min(5, "Title deve ter no mínimo 5 caracteres")
    .max(100, "Title deve ter no máximo 100 caracteres"),

  // ---------------------------------------------------
  // description
  // descrição do post
  // ---------------------------------------------------
  description: z
    .string({
      error: "Description deve ser uma string",
    })
    .trim()
    .min(10, "Description deve ter no mínimo 10 caracteres")
    .max(500, "Description deve ter no máximo 500 caracteres"),

  // ---------------------------------------------------
  // author
  // ---------------------------------------------------
  author: z
    .string({
      error: "Author deve ser uma string",
    })
    .trim()
    .min(3, "Author deve ter no mínimo 3 caracteres")
    .max(50, "Author deve ter no máximo 50 caracteres"),

  // ---------------------------------------------------
  // discipline
  // ---------------------------------------------------
  discipline: z
    .string({
      error: "Discipline deve ser uma string",
    })
    .trim()
    .min(3, "Discipline deve ter no mínimo 3 caracteres"),

  // ---------------------------------------------------
  // grade
  // hoje está String no seu schema mongoose
  // ---------------------------------------------------
  grade: z
    .string({
      error: "Grade deve ser uma string",
    })
    .trim(),

  // ---------------------------------------------------
  // semester
  // enum com valores permitidos
  // ---------------------------------------------------
  semester: z.enum(["2025.1", "2025.2", "2026.1"], {
    error: "Semester deve ser uma string",
  }),

  // ---------------------------------------------------
  // imageTitle
  // ---------------------------------------------------
  imageTitle: z
    .string({
      error: "Image title deve ser uma string",
    })
    .trim()
    .min(3, "Image title deve ter no mínimo 3 caracteres"),

  // ---------------------------------------------------
  // imageUrl
  // valida URL válida
  // ---------------------------------------------------
  imageUrl: z
    .string({
      error: "Image URL deve ser uma string",
    })
    .url("Image URL inválida"),
});

// ---------------------------------------------------
// TYPE AUTOMÁTICO TYPESCRIPT
// ---------------------------------------------------

export const updatePartialPostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePartialPostInput = z.infer<typeof updatePartialPostSchema>;
