FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/design-system/package.json ./packages/design-system/
COPY apps/partner-portal/package.json ./apps/partner-portal/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @health/partner-portal build

FROM node:20-alpine AS runner
RUN apk add --no-cache tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3130
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN mkdir -p ./public
COPY --from=builder /app/apps/partner-portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/partner-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/partner-portal/.next/static ./apps/partner-portal/.next/static
USER nextjs
EXPOSE 3130
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/partner-portal/server.js"]
