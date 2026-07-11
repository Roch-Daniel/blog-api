import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  createPostSchema,
  updatePartialPostSchema,
} from "../schemas/posts.schema";

export function registerPostDocs(registry: OpenAPIRegistry) {
  const objectIdParam = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID inválido do MongoDB");

  registry.register("CreatePost", createPostSchema);
  registry.register("UpdatePartialPost", updatePartialPostSchema);

  const postResponseSchema = z.object({
    _id: z.string().meta({ description: "ID gerado pelo banco" }),
    ...createPostSchema.shape,
    createDate: z.iso.datetime().meta({ description: "Data de criação" }),
    updateDate: z.iso
      .datetime()
      .meta({ description: "Data da última atualização" }),
  });

  registry.register("PostResponse", postResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/posts",
    tags: ["Posts"],
    summary: "Lista todos os posts",
    responses: {
      200: {
        description: "Lista de posts retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(postResponseSchema),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/posts/all",
    tags: ["Posts"],
    summary: "Lista todas as postagens, incluindo as com status inativo (requer token JWT de professor)",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Lista completa de posts retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(postResponseSchema),
            }),
          },
        },
      },
      401: {
        description: "Token não informado, inválido ou usuário inativo",
      },
      403: {
        description: "Usuário não possui email @professor.com",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/posts/{id}",
    tags: ["Posts"],
    summary: "Retorna um post pelo ID",
    request: {
      params: z.object({
        id: objectIdParam,
      }),
    },
    responses: {
      200: {
        description: "Post retornado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: postResponseSchema,
            }),
          },
        },
      },
      400: {
        description: "ID inválido",
      },
      404: {
        description: "Post não encontrado",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/posts",
    tags: ["Posts"],
    summary: "Cria um novo post (requer token JWT de professor)",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createPostSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Post criado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: postResponseSchema,
            }),
          },
        },
      },
      400: {
        description: "Dados inválidos ou body vazio",
      },
      401: {
        description: "Token não informado, inválido ou usuário inativo",
      },
      403: {
        description: "Usuário não possui email @professor.com",
      },
      404: {
        description: "Disciplina ou status não encontrado",
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/posts/{id}",
    tags: ["Posts"],
    summary: "Atualiza post completo (requer token JWT de professor)",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: objectIdParam,
      }),
      body: {
        content: {
          "application/json": {
            schema: createPostSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Post atualizado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: postResponseSchema,
            }),
          },
        },
      },
      400: {
        description: "Dados inválidos ou body vazio",
      },
      401: {
        description: "Token não informado, inválido ou usuário inativo",
      },
      403: {
        description: "Usuário não possui email @professor.com",
      },
      404: {
        description: "Post não encontrado",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/posts/{id}",
    tags: ["Posts"],
    summary: "Atualiza post parcialmente (requer token JWT de professor)",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: objectIdParam,
      }),
      body: {
        content: {
          "application/json": {
            schema: updatePartialPostSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Post atualizado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: postResponseSchema,
            }),
          },
        },
      },
      400: {
        description: "Dados inválidos ou body vazio",
      },
      401: {
        description: "Token não informado, inválido ou usuário inativo",
      },
      403: {
        description: "Usuário não possui email @professor.com",
      },
      404: {
        description: "Post não encontrado",
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/posts/{id}",
    tags: ["Posts"],
    summary: "Remove um post (requer token JWT de professor)",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: objectIdParam,
      }),
    },
    responses: {
      204: {
        description: "Post removido com sucesso",
      },
      401: {
        description: "Token não informado, inválido ou usuário inativo",
      },
      403: {
        description: "Usuário não possui email @professor.com",
      },
      404: {
        description: "Post não encontrado",
      },
    },
  });
}
