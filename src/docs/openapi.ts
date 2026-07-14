import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerAuthDocs } from "./auth.docs";
import { registerPostDocs } from "./posts.docs";
import { registerCatalogDocs } from "./catalog.docs";
import { registerHealthDocs } from "./health.docs";

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
registerHealthDocs(registry);

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Blog API",
    version: "1.0.0",
    description: [
      "# Blog API",
      "",
      "API REST desenvolvida para o **Tech Challenge** da graduação, com foco na construção de um back-end organizado, escalável e containerizado.",
      "",
      "## Stack utilizada",
      "- **Node.js** + **Express**: servidor e rotas",
      "- **MongoDB**: persistência de dados",
      "- **Docker**: containerização e orquestração via Docker Compose",
      "- **Jest**: testes automatizados",
      "",
      "## Boas práticas aplicadas",
      "- Separação de responsabilidades (controllers, services, models, middlewares)",
      "- Testes automatizados de integração cobrindo autenticação e CRUD de posts",
      "- Build multi-stage e imagem final baseada em distroless (menor superfície de ataque)",
      "",
      "## Autenticação",
      "Rotas protegidas exigem um token JWT no cabeçalho:",
      "`Authorization: Bearer <seu-token>`",
      "",
      "Obtenha um token através da rota `POST /auth/login`.",
    ].join("\n"),
    contact: {
      name: "ArcaZero GitHub",
      url: "https://github.com/Roch-Daniel/blog-api",
    },
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3000",
      description: "Ambiente atual",
    },
    {
      url: "http://localhost:3000",
      description: "Desenvolvimento local",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Autenticação de usuários e emissão de tokens JWT",
    },
    {
      name: "Posts",
      description: "Criação, edição, exclusão e consulta de posts do blog",
    },
    {
      name: "Catalog",
      description:
        "Listagem de dados de apoio (usuários, disciplinas e status)",
    },
    {
      name: "System",
      description: "Endpoints de infraestrutura e monitoramento (health check)",
    },
  ],
});
