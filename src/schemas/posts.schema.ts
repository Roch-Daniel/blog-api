import { z } from "zod";

export const createPostSchema = z
  .object({
    title: z.string().trim().min(5).max(100).meta({
      description: "Título do post",
      example: "Meu primeiro post",
    }),

    description: z.string().trim().min(10).max(500).meta({
      description: "Conteúdo do post",
      example: "Descrição do post aqui.",
    }),

    author: z.string().trim().min(3).max(50).meta({
      description: "Autor da postagem",
      example: "Joao Blibau",
    }),

    discipline: z.string().trim().min(3).meta({
      description: "Disciplina relacionada ao post",
      example: "Desenvolvimento Web",
    }),

    grade: z.string().trim().meta({
      description: "Nota em formato textual",
      example: "8.5",
    }),

    semester: z.enum(["2025.1", "2025.2", "2026.1"]).meta({
      description: "Semestre do post",
      example: "2025.1",
    }),

    imageTitle: z.string().trim().min(3).meta({
      description: "Título da imagem",
      example: "Imagem do projeto",
    }),

    imageUrl: z.url().meta({
      description: "URL da imagem",
      example: "https://exemplo.com/imagem.jpg",
    }),
  })
  .meta({
    id: "CreatePost",
    description: "Schema de criação de post",
  });

export const updatePartialPostSchema = createPostSchema.partial().meta({
  id: "UpdatePartialPost",
  description: "Schema de atualização parcial de post",
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePartialPostInput = z.infer<typeof updatePartialPostSchema>;
