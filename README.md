# Microservices Node Lesson — REST + RabbitMQ

Este projeto foi feito para **aula prática** mostrando uma arquitetura mínima de microserviços em Node.js com:

- **API Gateway** (Express) — roteia chamadas síncronas para os serviços.
- **Users Service** (Express) — CRUD de usuários; publica eventos em **RabbitMQ**.
- **Orders Service** (Express) — cria pedidos; consome eventos do RabbitMQ e valida usuários via chamada síncrona.
- **RabbitMQ** — broker de mensagens (fila/exchange).

> Foco didático: demonstrar **comunicação síncrona** (HTTP) e **assíncrona** (mensageria), isolamento de serviços, observabilidade simples (logs) e estratégias de resiliência (retries básicos).

---

## Arquitetura

```
client -> [API Gateway] --(HTTP)--> [Users Service]
                         --(HTTP)--> [Orders Service]
[Users Service] --(event user.created)--> [RabbitMQ] --> [Orders Service consumer]
```

- O **Users Service** publica `user.created` a cada criação.
- O **Orders Service** consome `user.created` para manter um cache simples e também chama o **Users Service** (HTTP) para validação síncrona ao criar pedido.

---

## Requisitos

- Docker + Docker Compose
- Porta livre: 3000 (gateway), 3001 (users), 3002 (orders), 15672 (RabbitMQ management), 5672 (AMQP)

---

## Subir o ambiente

```bash
docker compose up --build
```

Aguarde os containers subirem. A UI do RabbitMQ estará em: http://localhost:15672 (user: `guest`, pass: `guest`).

---

## Testes rápidos (curl)

### Criar usuário

```bash
curl -X POST http://localhost:3000/users \  -H "Content-Type: application/json" \  -d '{"name":"Bruno Nascimento","email":"bruno@example.com"}'
```

### Atualizar usuário (publica `user.updated`)

```bash
# Troque <userId> pelo id retornado na criação do usuário (ex.: "u_abc123")
curl -X PATCH http://localhost:3000/users/<userId> \
  -H "Content-Type: application/json" \
  -d '{"name":"Bruno Silva","email":"bruno.silva@example.com"}'
```

### Listar usuários

```bash
curl http://localhost:3000/users
```

### Criar pedido (valida usuário síncrono e publica `order.created`)

```bash
# Troque <userId> pelo id retornado na criação do usuário (ex.: "u_1")
curl -X POST http://localhost:3000/orders \  -H "Content-Type: application/json" \  -d '{"userId":"u_1","items":[{"sku":"BOOK-123","qty":2}], "total": 120.50}'
```

### Cancelar pedido (publica `order.cancelled`)

```bash
# Troque <orderId> pelo id retornado na criação do pedido (ex.: "o_abc123")
curl -X PATCH http://localhost:3000/orders/<orderId>/cancel
```

### Listar pedidos

```bash
curl http://localhost:3000/orders
```

Verifique os logs do **Orders Service** para ver consumo de eventos `user.created` e cache sendo populado.

---

## Documentação API (Swagger)

A documentação OpenAPI/Swagger está disponível **diretamente em cada microserviço**:

- **Users Service**: http://localhost:3001/docs
- **Orders Service**: http://localhost:3002/docs
- **Gateway** (agregado): http://localhost:3000/docs

Cada serviço expõe sua própria documentação interativa com Swagger UI, permitindo testar os endpoints diretamente.

---

## Estrutura de pastas

```
microservices-node-lesson/
├─ docker-compose.yml
├─ gateway/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ src/
│     └─ index.js
├─ services/
│  ├─ users-service/
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.js
│  │     └─ amqp.js
│  └─ orders-service/
│     ├─ Dockerfile
│     ├─ package.json
│     └─ src/
│        ├─ index.js
│        └─ amqp.js
└─ common/
   └─ events.js
```

---

## Conceitos cobrados em aula

1. **Bounded Context** (Users vs Orders).
2. **Sincronismo vs Assíncronismo** (HTTP vs eventos).
3. **Resiliência** (retries simples para AMQP; timeouts HTTP).
4. **Idempotência** (ex.: não reprocessar `user.created` duas vezes — demo simplificado com cache).
5. **Observabilidade** (logs claros) e **Contrato de APIs** (rotas REST e payloads JSON).

---

## Conceitos didáticos demonstrados

- Síncrono vs Assíncrono: Gateway/HTTP vs eventos RabbitMQ.

- Resiliência: timeout no Orders → Users, fallback para cache populado por eventos.

- Idempotência (básica): consumo de user.created atualiza cache sem duplicar.

- Isolamento por serviço: cada app com seu Dockerfile e variáveis de ambiente.

- Eventos de cancelamento: order.cancelled é publicado e consumido pelo Users Service (exemplo didático).
