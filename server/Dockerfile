# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Produção
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Garante permissões
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app/data /app/uploads

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
