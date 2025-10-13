const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Users Service",
    version: "1.0.0",
    description: "Microserviço para gerenciamento de usuários",
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
        description: "Verifica se o serviço está funcionando",
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
                  },
                },
              },
            },
          },
        },
      },
    },
    "/": {
      get: {
        summary: "Listar usuários",
        description: "Retorna todos os usuários cadastrados",
        tags: ["Users"],
        responses: {
          200: {
            description: "Lista de usuários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Criar usuário",
        description: "Cria um novo usuário no sistema",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: {
                    type: "string",
                    description: "Nome do usuário",
                    example: "João Silva",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email do usuário",
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
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: {
            description: "Dados inválidos",
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
        },
      },
    },
    "/{id}": {
      get: {
        summary: "Buscar usuário por ID",
        description: "Retorna um usuário específico pelo seu ID",
        tags: ["Users"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do usuário",
            schema: { type: "string" },
            example: "u_abc123",
          },
        ],
        responses: {
          200: {
            description: "Usuário encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
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
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID único do usuário",
            example: "u_abc123",
          },
          name: {
            type: "string",
            description: "Nome do usuário",
            example: "João Silva",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email do usuário",
            example: "joao@exemplo.com",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do usuário",
            example: "2025-10-13T10:30:00.000Z",
          },
        },
        required: ["id", "name", "email", "createdAt"],
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
      description: "Operações relacionadas aos usuários",
    },
  ],
};

export default swaggerSpec;
