FROM node:20-alpine
WORKDIR /app/services/users-service

# Dependências do sistema para Prisma em Alpine
RUN apk add --no-cache openssl libc6-compat

COPY services/users-service/package.json ./package.json
RUN npm install --only=production

# Copiar schema Prisma e gerar client no build (gera mais rápido no start)
COPY services/users-service/prisma ./prisma
RUN npx prisma generate

COPY services/users-service/src ./src
COPY common /app/common

ENV PORT=3001
EXPOSE 3001
CMD ["npm","start"]