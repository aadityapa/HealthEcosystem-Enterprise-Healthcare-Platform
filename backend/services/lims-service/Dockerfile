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
COPY backend/services/lims-service/package.json backend/services/lims-service/
RUN pnpm install --frozen-lockfile --filter @health/lims-service...

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY backend/services/lims-service ./backend/services/lims-service
RUN pnpm --filter @health/db generate
RUN pnpm --filter @health/db build
RUN pnpm --filter @health/logger build
RUN pnpm --filter @health/shared-types build
RUN pnpm --filter @health/validation build
RUN pnpm --filter @health/events build
RUN pnpm --filter @health/lims-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/backend/services/lims-service/dist ./backend/services/lims-service/dist
COPY --from=build /app/backend/services/lims-service/package.json ./backend/services/lims-service/
EXPOSE 3004
CMD ["node", "backend/services/lims-service/dist/main.js"]
