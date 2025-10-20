const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Gateway",
    version: "1.0.0",
    description: "Gateway de API para agregação dos microserviços. Para documentação completa dos serviços, acesse:\n- Users Service: http://localhost:3001/docs\n- Orders Service: http://localhost:3002/docs",
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
  },
  tags: [
    {
      name: "Health",
      description: "Endpoints de monitoramento do gateway",
    },
  ],
  externalDocs: {
    description: "Documentação dos microserviços",
    url: "http://localhost:3001/docs",
  },
};

export default swaggerSpec;
