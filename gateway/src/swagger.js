const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Gateway",
    version: "1.0.0",
    description: "Gateway de API para agregação dos microserviços",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Servidor de desenvolvimento",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Healthcheck do Gateway",
        description: "Verifica se o gateway está funcionando",
        tags: ["Health"],
        responses: {
          200: {
            description: "Gateway funcionando corretamente",
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
    "/users": {
      get: {
        summary: "Listar usuários",
        description: "Proxy para o endpoint de listagem de usuários",
        tags: ["Users Proxy"],
        responses: {
          200: {
            description: "Lista de usuários (proxied from users-service)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                      createdAt: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Criar usuário",
        description: "Proxy para criação de usuário",
        tags: ["Users Proxy"],
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
            description: "Usuário criado (proxied from users-service)",
          },
          400: {
            description: "Erro de validação",
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Buscar usuário por ID",
        description: "Proxy para busca de usuário específico",
        tags: ["Users Proxy"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "u_abc123",
          },
        ],
        responses: {
          200: {
            description: "Usuário encontrado (proxied from users-service)",
          },
          404: {
            description: "Usuário não encontrado",
          },
        },
      },
    },
    "/orders": {
      get: {
        summary: "Listar pedidos",
        description: "Proxy para o endpoint de listagem de pedidos",
        tags: ["Orders Proxy"],
        responses: {
          200: {
            description: "Lista de pedidos (proxied from orders-service)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      userId: { type: "string" },
                      items: { type: "array" },
                      total: { type: "number" },
                      status: { type: "string" },
                      createdAt: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Criar pedido",
        description: "Proxy para criação de pedido",
        tags: ["Orders Proxy"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "items", "total"],
                properties: {
                  userId: { type: "string", example: "u_abc123" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sku: { type: "string", example: "PROD-001" },
                        qty: { type: "integer", example: 2 },
                      },
                    },
                  },
                  total: { type: "number", example: 299.99 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Pedido criado (proxied from orders-service)",
          },
          400: {
            description: "Erro de validação",
          },
          503: {
            description: "Serviço indisponível",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Endpoints de monitoramento do gateway",
    },
    {
      name: "Users Proxy",
      description: "Endpoints de usuários (proxy para users-service)",
    },
    {
      name: "Orders Proxy",
      description: "Endpoints de pedidos (proxy para orders-service)",
    },
  ],
  externalDocs: {
    description: "Documentação completa dos microserviços",
    url: "/docs",
  },
};

export default swaggerSpec;
