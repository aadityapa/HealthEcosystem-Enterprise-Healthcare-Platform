FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/design-system/package.json ./packages/design-system/
COPY frontend/patient-mobile/package.json ./frontend/patient-mobile/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @health/patient-mobile build

FROM node:20-alpine AS runner
RUN apk add --no-cache tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3110
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/frontend/patient-mobile/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/patient-mobile/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/patient-mobile/.next/static ./frontend/patient-mobile/.next/static
USER nextjs
EXPOSE 3110
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "frontend/patient-mobile/server.js"]
