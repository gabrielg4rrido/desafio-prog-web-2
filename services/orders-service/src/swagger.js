const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Orders Service API",
    version: "1.0.0",
    description: "Microserviço de gerenciamento de pedidos",
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
        summary: "Listar pedidos",
        description: "Retorna a lista de todos os pedidos cadastrados",
        tags: ["Orders"],
        responses: {
          200: {
            description: "Lista de pedidos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "o_abc123" },
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
                      status: { type: "string", example: "created" },
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
        summary: "Criar pedido",
        description:
          "Cria um novo pedido após validar o usuário (síncrono via HTTP) e publica evento order.created no RabbitMQ",
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
                    example: "u_abc123",
                    description: "ID do usuário que fez o pedido",
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sku: { type: "string", example: "PROD-001" },
                        qty: { type: "integer", example: 2 },
                      },
                    },
                    description: "Lista de itens do pedido",
                  },
                  total: {
                    type: "number",
                    example: 299.99,
                    description: "Valor total do pedido",
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
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "o_abc123" },
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
                    status: { type: "string", example: "created" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Dados inválidos ou usuário não encontrado",
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
            description:
              "Users Service indisponível e usuário não encontrado no cache",
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
    "/{id}/cancel": {
      patch: {
        summary: "Cancelar pedido",
        description:
          "Cancela um pedido existente e publica evento order.cancelled no RabbitMQ",
        tags: ["Orders"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID do pedido a ser cancelado",
            schema: {
              type: "string",
              example: "o_abc123",
            },
          },
        ],
        responses: {
          200: {
            description: "Pedido cancelado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "o_abc123" },
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
                    status: { type: "string", example: "cancelled" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          400: {
            description: "Pedido já está cancelado",
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
            description: "Pedido não encontrado",
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
      name: "Orders",
      description: "Operações de gerenciamento de pedidos",
    },
  ],
};

export default swaggerSpec;
