FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/logger/package.json ./packages/logger/
COPY packages/events/package.json ./packages/events/
COPY packages/validation/package.json ./packages/validation/
COPY services/patient-service/package.json ./services/patient-service/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @health/db generate
RUN pnpm --filter @health/shared-types build
RUN pnpm --filter @health/logger build
RUN pnpm --filter @health/events build
RUN pnpm --filter @health/validation build
RUN pnpm --filter @health/db build
RUN pnpm --filter @health/patient-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/services/patient-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3002
CMD ["node", "dist/main.js"]
