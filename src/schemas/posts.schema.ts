import "../config/zod";
import { z } from "zod";

const stripHtml = (value: string): string => {
  let result = value;
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  result = result.replace(/<[^>]*>/g, "");
  result = result.trim();
  return result;
};

const sanitizedField = (label: string, minLen: number, maxLen?: number) =>
  z
    .string({ error: "Campo obrigatório não informado: " + label })
    .trim()
    .transform(stripHtml)
    .refine((val) => val.length > 0, {
      message: "Campo obrigatório não informado: " + label,
    })
    .refine((val) => val.length >= minLen, {
      message:
        "O campo " + label + " deve ter pelo menos " + minLen + " caracteres",
    })
    .refine((val) => maxLen === undefined || val.length <= maxLen, {
      message:
        "O campo " + label + " deve ter no maximo " + maxLen + " caracteres",
    });

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido do MongoDB");

export const createPostSchema = z
  .object({
    title: sanitizedField("título", 5, 100).meta({
      description: "Título do post",
      example: "Meu primeiro post",
    }),
    content: sanitizedField("conteúdo", 10).meta({
      description: "Conteúdo completo do post",
      example: "Aqui vai o corpo do texto do post...",
    }),
    summary: sanitizedField("resumo", 10, 300).meta({
      description: "Resumo do post",
      example: "Uma breve introdução sobre o assunto abordado.",
    }),
    imageUrl: z.url("imageUrl deve ser uma URL válida").optional().meta({
      description: "URL da imagem de capa (opcional)",
      example: "https://exemplo.com/imagem.jpg",
    }),
    series: z.string().trim().optional().meta({
      description: "Série/Ano letivo relacionado (opcional)",
      example: "3º Ano Ensino Médio",
    }),
    semester: z
      .string({ error: "Campo obrigatório não informado: semestre" })
      .trim()
      .meta({
        description: "Semestre letivo",
        example: "1",
      }),
    disciplineId: objectIdSchema.meta({
      description: "ID da Disciplina relacionada",
      example: "60d5ecb8b392d21534c32b12",
    }),
    isFeatured: z.boolean().optional().default(false).meta({
      description: "Indica se o post é destacado",
      example: false,
    }),
    authorId: objectIdSchema.optional().meta({
      description: "ID do Usuário autor do post via token JWT",
      example: "60d5ecb8b392d21534c32b11",
    }),
    statusId: objectIdSchema.meta({
      description: "ID do Status da postagem",
      example: "60d5ecb8b392d21534c32b13",
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
