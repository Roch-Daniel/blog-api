import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  createPostSchema,
  updatePartialPostSchema,
} from "../schemas/posts.schema";
export const registry = new OpenAPIRegistry();

// ---------------------------------------------------
// SCHEMAS
// ---------------------------------------------------
registry.register("CreatePost", createPostSchema);
registry.register("UpdatePartialPost", updatePartialPostSchema);

// ---------------------------------------------------
// RESPONSE SCHEMA
// ---------------------------------------------------
const postResponseSchema = z.object({
  _id: z.string(),
  ...createPostSchema.shape,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ---------------------------------------------------
// GET POSTS
// ---------------------------------------------------
registry.registerPath({
  method: "get",
  path: "/posts",
  tags: ["Posts"],
  summary: "Lista todos os posts",
  responses: {
    200: {
      description: "Lista de posts retornada",
      content: {
        "application/json": {
          schema: z.object({
            posts: z.array(postResponseSchema),
          }),
        },
      },
    },
  },
});

// ---------------------------------------------------
// CREATE POST
// ---------------------------------------------------

registry.registerPath({
  method: "post",
  path: "/posts",
  tags: ["Posts"],
  summary: "Cria um novo post",
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
    },
  },
});

// ---------------------------------------------------
// UPDATE PUT
// ---------------------------------------------------

registry.registerPath({
  method: "put",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Atualiza post completo",
  request: {
    params: z.object({
      id: z.string(),
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
    },
  },
});

// ---------------------------------------------------
// UPDATE PATCH
// ---------------------------------------------------

registry.registerPath({
  method: "patch",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Atualiza parcialmente um post",
  request: {
    params: z.object({
      id: z.string(),
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
      description: "Post atualizado parcialmente",
    },
  },
});

// ---------------------------------------------------
// DELETE
// ---------------------------------------------------

registry.registerPath({
  method: "delete",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Remove um post",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Post removido com sucesso",
    },
  },
});

// ---------------------------------------------------
// OPENAPI DOCUMENT
// ---------------------------------------------------

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Blog API",
    version: "1.0.0",
    description: "Documentação da API",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
});
