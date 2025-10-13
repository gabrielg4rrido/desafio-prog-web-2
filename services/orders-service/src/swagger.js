const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Orders Service",
    version: "1.0.0",
    description: "Microserviço para gerenciamento de pedidos",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3002}`,
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
        summary: "Listar pedidos",
        description: "Retorna todos os pedidos cadastrados",
        tags: ["Orders"],
        responses: {
          200: {
            description: "Lista de pedidos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Criar pedido",
        description: "Cria um novo pedido no sistema",
        tags: ["Orders"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "items", "total"],
                properties: {
                  userId: {
                    type: "string",
                    description: "ID do usuário que está fazendo o pedido",
                    example: "u_abc123",
                  },
                  items: {
                    type: "array",
                    description: "Lista de itens do pedido",
                    items: {
                      type: "object",
                      properties: {
                        sku: {
                          type: "string",
                          description: "Código do produto",
                          example: "PROD-001",
                        },
                        qty: {
                          type: "integer",
                          description: "Quantidade do produto",
                          example: 2,
                          minimum: 1,
                        },
                      },
                      required: ["sku", "qty"],
                    },
                    minItems: 1,
                  },
                  total: {
                    type: "number",
                    description: "Valor total do pedido",
                    example: 299.99,
                    minimum: 0,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Pedido criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          400: {
            description: "Requisição inválida",
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
          503: {
            description: "Dependência indisponível",
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
      Order: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID único do pedido",
            example: "o_xyz789",
          },
          userId: {
            type: "string",
            description: "ID do usuário que fez o pedido",
            example: "u_abc123",
          },
          items: {
            type: "array",
            description: "Lista de itens do pedido",
            items: {
              type: "object",
              properties: {
                sku: {
                  type: "string",
                  description: "Código do produto",
                  example: "PROD-001",
                },
                qty: {
                  type: "integer",
                  description: "Quantidade do produto",
                  example: 2,
                },
              },
            },
          },
          total: {
            type: "number",
            description: "Valor total do pedido",
            example: 299.99,
          },
          status: {
            type: "string",
            description: "Status atual do pedido",
            example: "created",
            enum: [
              "created",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do pedido",
            example: "2025-10-13T10:30:00.000Z",
          },
        },
        required: ["id", "userId", "items", "total", "status", "createdAt"],
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Endpoints de monitoramento",
    },
    {
      name: "Orders",
      description: "Operações relacionadas aos pedidos",
    },
  ],
};

export default swaggerSpec;
