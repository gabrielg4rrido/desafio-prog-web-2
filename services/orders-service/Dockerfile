FROM node:20-alpine
WORKDIR /app/services/orders-service

# Dependências do sistema para Prisma em Alpine
RUN apk add --no-cache openssl libc6-compat

COPY services/orders-service/package.json ./package.json
RUN npm install --only=production

# Copiar schema Prisma e gerar client no build
COPY services/orders-service/prisma ./prisma
RUN npx prisma generate

COPY services/orders-service/src ./src
COPY common /app/common

ENV PORT=3002
EXPOSE 3002
CMD ["npm","start"]