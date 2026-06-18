FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/design-system/package.json ./packages/design-system/
COPY frontend/web-admin/package.json ./frontend/web-admin/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @health/web-admin build

FROM node:20-alpine AS runner
RUN apk add --no-cache tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3100
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/frontend/web-admin/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/web-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/web-admin/.next/static ./frontend/web-admin/.next/static
USER nextjs
EXPOSE 3100
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "frontend/web-admin/server.js"]
