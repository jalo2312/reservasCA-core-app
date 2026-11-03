# ==========================================================
# ETAPA 1: Builder (compilación y generación de artefactos)
# ==========================================================
FROM node:24-alpine AS builder

RUN npm i -g pnpm@12.3.4

WORKDIR /app

# 1) Manifiestos de dependencias (capa cacheada mientras no cambie el lockfile)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 2) Esquema y migraciones (necesarios para prisma generate)
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# 3) Código fuente
COPY . .

# Genera el cliente Prisma para la plataforma del contenedor (linux-musl)
RUN pnpm exec prisma generate

# Compila TypeScript a JavaScript (/app/dist)
RUN pnpm build

# ==========================================================
# ETAPA 2: Runner (entorno de ejecución mínimo de producción)
# ==========================================================
FROM node:24-alpine AS runner

# openssl es requerido por el motor nativo de Prisma en Alpine
RUN apk add --no-cache openssl && npm i -g pnpm@12.3.4

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
# El binario del motor nativo (.node) no lo copia tsc: se trae explícitamente
COPY --from=builder /app/src/generated/prisma/*.node ./dist/generated/prisma/
COPY --from=builder /app/src/generated/prisma/*.node ./src/generated/prisma/

EXPOSE 3001

# 1) Aplica las migraciones pendientes  2) Arranca la API
# `--allow-build` habilita el script de descarga del motor de Prisma dentro de dlx
CMD ["sh", "-c", "pnpm dlx --allow-build=@prisma/engines prisma@6.19.3 migrate deploy && node dist/server.js"]
