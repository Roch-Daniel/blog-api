import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { healthResponseSchema } from "../schemas/health.schema";

export function registerHealthDocs(registry: OpenAPIRegistry) {
  registry.register("HealthResponse", healthResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "Verifica a saúde da aplicação",
    description: "Retorna o estado da API e da conexão com o banco de dados.",

    responses: {
      200: {
        description: "Aplicação funcionando corretamente",
        content: {
          "application/json": {
            schema: healthResponseSchema,
          },
        },
      },

      503: {
        description: "Aplicação disponível, porém sem conexão com o banco",
        content: {
          "application/json": {
            schema: healthResponseSchema,
          },
        },
      },
    },
  });
}
