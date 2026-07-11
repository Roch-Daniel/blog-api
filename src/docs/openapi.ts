import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerAuthDocs } from "./auth.docs";
import { registerPostDocs } from "./posts.docs";
import { registerCatalogDocs } from "./catalog.docs";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Token JWT obtido via POST /auth/login. Restritas a usuários com email @professor.com.",
});

registerAuthDocs(registry);
registerPostDocs(registry);
registerCatalogDocs(registry);

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
