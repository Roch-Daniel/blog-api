import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { USER_ROLES } from "../constants/roles.constant";

export function registerAuthDocs(registry: OpenAPIRegistry) {
  const loginRequestSchema = z.object({
    email: z.email().meta({
      description: "Email do usuário cadastrado",
      example: "ana@professor.com",
    }),
    password: z.string().meta({
      description: "Senha do usuário",
      example: "123456",
    }),
  });

  const loginResponseSchema = z.object({
    token: z.string().meta({
      description: "Token JWT com validade de 8 horas, envia no header Authorization: Bearer <token>",
    }),
    user: z.object({
      id: z.string().meta({ description: "ID do usuário" }),
      name: z.string().meta({ description: "Nome do usuário" }),
      username: z.string().meta({ description: "Nome de acesso do usuário" }),
      email: z.string().meta({ description: "Email do usuário" }),
      role: z.enum(USER_ROLES).meta({
        description: "Perfil salvo no cadastro do usuário",
      }),
    }),
  });

  registry.register("LoginRequest", loginRequestSchema);
  registry.register("LoginResponse", loginResponseSchema);

  registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Realiza login e retorna o token JWT",
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login realizado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: loginResponseSchema,
            }),
          },
        },
      },
      400: {
        description: "Email ou senha não informados",
      },
      401: {
        description: "Credenciais inválidas ou usuário inativo",
      },
      429: {
        description: "Limite de 5 tentativas com falha por email a cada 15 minutos excedido",
      },
    },
  });
}
