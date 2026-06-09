FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/logger/package.json packages/logger/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/validation/package.json packages/validation/
COPY packages/events/package.json packages/events/
COPY services/master-data-service/package.json services/master-data-service/
RUN pnpm install --frozen-lockfile --filter @health/master-data-service...

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/master-data-service ./services/master-data-service
RUN pnpm --filter @health/db generate
RUN pnpm --filter @health/db build
RUN pnpm --filter @health/logger build
RUN pnpm --filter @health/shared-types build
RUN pnpm --filter @health/validation build
RUN pnpm --filter @health/events build
RUN pnpm --filter @health/master-data-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/services/master-data-service/dist ./services/master-data-service/dist
COPY --from=build /app/services/master-data-service/package.json ./services/master-data-service/
EXPOSE 3007
CMD ["node", "services/master-data-service/dist/main.js"]
