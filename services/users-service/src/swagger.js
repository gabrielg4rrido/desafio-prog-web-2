const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Users Service API",
    version: "1.0.0",
    description: "Microserviço de gerenciamento de usuários",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: "Servidor de desenvolvimento",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Healthcheck",
        description:
          "Verifica se o serviço e o banco de dados estão funcionando",
        tags: ["Health"],
        responses: {
          200: {
            description: "Serviço funcionando corretamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    service: { type: "string" },
                    db: { type: "string" },
                  },
                },
              },
            },
          },
          503: {
            description: "Serviço indisponível",
          },
        },
      },
    },
    "/": {
      get: {
        summary: "Listar usuários",
        description: "Retorna a lista de todos os usuários cadastrados",
        tags: ["Users"],
        responses: {
          200: {
            description: "Lista de usuários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "u_abc123" },
                      name: { type: "string", example: "João Silva" },
                      email: { type: "string", example: "joao@exemplo.com" },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno",
          },
        },
      },
      post: {
        summary: "Criar usuário",
        description:
          "Cria um novo usuário e publica evento user.created no RabbitMQ",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: { type: "string", example: "João Silva" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joao@exemplo.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "u_abc123" },
                    name: { type: "string", example: "João Silva" },
                    email: { type: "string", example: "joao@exemplo.com" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Dados inválidos ou email já existe",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno",
          },
        },
      },
    },
    "/{id}": {
      get: {
        summary: "Buscar usuário por ID",
        description: "Retorna os dados de um usuário específico",
        tags: ["Users"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID do usuário",
            example: "u_abc123",
          },
        ],
        responses: {
          200: {
            description: "Usuário encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "u_abc123" },
                    name: { type: "string", example: "João Silva" },
                    email: { type: "string", example: "joao@exemplo.com" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          404: {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "not found" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno",
          },
        },
      },
      patch: {
        summary: "Atualizar usuário",
        description:
          "Atualiza os dados de um usuário existente e publica evento user.updated no RabbitMQ",
        tags: ["Users"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID do usuário a ser atualizado",
            schema: {
              type: "string",
              example: "u_abc123",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    example: "João Silva Atualizado",
                    description: "Novo nome do usuário (opcional)",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joao.novo@exemplo.com",
                    description: "Novo email do usuário (opcional)",
                  },
                },
                minProperties: 1,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Usuário atualizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "u_abc123" },
                    name: { type: "string", example: "João Silva Atualizado" },
                    email: {
                      type: "string",
                      example: "joao.novo@exemplo.com",
                    },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Dados inválidos ou email já existe",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          404: {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Endpoints de monitoramento",
    },
    {
      name: "Users",
      description: "Operações de gerenciamento de usuários",
    },
  ],
};

export default swaggerSpec;
