#!/usr/bin/env node
/**
 * Scaffold a NestJS microservice from the billing-service template.
 * Usage: node scripts/scaffold-health-service.mjs <name> <port> <apiPrefix> <contextKey>
 * Example: node scripts/scaffold-health-service.mjs inventory 3009 inventory inventoryContext
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const [name, portStr, apiPrefix, contextKey] = process.argv.slice(2);
if (!name || !portStr || !apiPrefix || !contextKey) {
  console.error('Usage: node scaffold-health-service.mjs <name> <port> <apiPrefix> <contextKey>');
  process.exit(1);
}

const port = parseInt(portStr, 10);
const serviceName = `${name}-service`;
const pkgName = `@health/${serviceName}`;
const serviceDir = path.join(root, 'backend', 'services', serviceName);
const srcDir = path.join(serviceDir, 'src');

const copyDirs = ['database', 'redis', 'common/filters', 'common/interceptors'];

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(rel, content) {
  const full = path.join(serviceDir, rel);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, content);
}

// Copy from billing-service
const billingSrc = path.join(root, 'backend', 'services', 'billing-service', 'src');
for (const dir of copyDirs) {
  const src = path.join(billingSrc, dir);
  const dest = path.join(srcDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Adapt tenant context interceptor
const interceptorPath = path.join(srcDir, 'common/interceptors/tenant-context.interceptor.ts');
let interceptor = fs.readFileSync(interceptorPath, 'utf8');
interceptor = interceptor
  .replace(/billingContext/g, contextKey)
  .replace(/from '\.\.\/context\/billing-context'/g, `from '../context/request-context'`)
  .replace(/TENANT_HEADERS/g, 'TENANT_HEADERS');
fs.writeFileSync(interceptorPath, interceptor);

// Request context
writeFile(
  'src/common/context/request-context.ts',
  `export const TENANT_HEADERS = {
  tenantId: 'x-tenant-id',
  organizationId: 'x-organization-id',
  branchId: 'x-branch-id',
  userId: 'x-user-id',
} as const;

export interface ServiceRequestContext {
  tenantId: string;
  organizationId: string;
  branchId: string;
  userId: string;
}
`,
);

writeFile(
  'src/common/decorators/context.decorator.ts',
  `import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ServiceRequestContext } from '../context/request-context';

export const ServiceContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ServiceRequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.${contextKey};
  },
);
`,
);

writeFile(
  'src/common/filters/global-exception.filter.ts',
  fs.readFileSync(path.join(billingSrc, 'common/filters/global-exception.filter.ts'), 'utf8'),
);

writeFile(
  'src/common/interceptors/response-transform.interceptor.ts',
  fs.readFileSync(path.join(billingSrc, 'common/interceptors/response-transform.interceptor.ts'), 'utf8'),
);

writeFile(
  'src/health.controller.ts',
  `import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api/v1/${apiPrefix}')
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  health() {
    return { status: 'ok', service: '${serviceName}' };
  }
}
`,
);

writeFile(
  'src/main.ts',
  `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createLogger } from '@health/logger';

async function bootstrap() {
  const logger = createLogger({ service: '${serviceName}' });
  const app = await NestFactory.create(AppModule, { logger: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3100', 'http://localhost:3110'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('HealthEcosystem ${name.charAt(0).toUpperCase() + name.slice(1)} Service')
    .setDescription('${serviceName} API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.${name.toUpperCase().replace(/-/g, '_')}_SERVICE_PORT ?? ${port};
  await app.listen(port);
  logger.info(\`${serviceName} running on port \${port}\`);
}

bootstrap();
`,
);

writeFile(
  'src/app.module.ts',
  `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
`,
);

writeFile(
  'package.json',
  JSON.stringify(
    {
      name: pkgName,
      version: '1.0.0',
      private: true,
      scripts: {
        build: 'nest build',
        dev: 'nest start --watch',
        start: 'node dist/main',
        'start:prod': 'node dist/main',
        lint: 'eslint "{src,test}/**/*.ts"',
        test: 'jest',
        'test:watch': 'jest --watch',
        'type-check': 'tsc --noEmit',
        clean: 'rimraf dist',
      },
      dependencies: {
        '@health/db': 'workspace:*',
        '@health/events': 'workspace:*',
        '@health/logger': 'workspace:*',
        '@health/shared-types': 'workspace:*',
        '@health/validation': 'workspace:*',
        '@nestjs/common': '^10.4.15',
        '@nestjs/config': '^3.3.0',
        '@nestjs/core': '^10.4.15',
        '@nestjs/cqrs': '^10.2.8',
        '@nestjs/platform-express': '^10.4.15',
        '@nestjs/swagger': '^8.1.0',
        'class-transformer': '^0.5.1',
        'class-validator': '^0.14.1',
        'ioredis': '^5.4.2',
        'reflect-metadata': '^0.2.2',
        'rxjs': '^7.8.1',
        'uuid': '^11.0.3',
      },
      devDependencies: {
        '@nestjs/cli': '^10.4.9',
        '@nestjs/schematics': '^10.2.3',
        '@nestjs/testing': '^10.4.15',
        '@types/express': '^5.0.0',
        '@types/jest': '^29.5.14',
        '@types/node': '^22.10.0',
        '@types/uuid': '^10.0.0',
        jest: '^29.7.0',
        rimraf: '^6.0.1',
        'ts-jest': '^29.2.5',
        'ts-node': '^10.9.2',
        typescript: '^5.7.2',
      },
    },
    null,
    2,
  ) + '\n',
);

writeFile('nest-cli.json', fs.readFileSync(path.join(root, 'backend/services/billing-service/nest-cli.json'), 'utf8'));
writeFile('tsconfig.json', fs.readFileSync(path.join(root, 'backend/services/billing-service/tsconfig.json'), 'utf8'));
writeFile('jest.config.js', fs.readFileSync(path.join(root, 'backend/services/billing-service/jest.config.js'), 'utf8'));

writeFile(
  'Dockerfile',
  `FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY packages/logger/package.json packages/logger/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/validation/package.json packages/validation/
COPY packages/events/package.json packages/events/
COPY backend/services/${serviceName}/package.json backend/services/${serviceName}/
RUN pnpm install --frozen-lockfile --filter ${pkgName}...

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY backend/services/${serviceName} ./backend/services/${serviceName}
RUN pnpm --filter @health/db generate
RUN pnpm --filter @health/db build
RUN pnpm --filter @health/logger build
RUN pnpm --filter @health/shared-types build
RUN pnpm --filter @health/validation build
RUN pnpm --filter @health/events build
RUN pnpm --filter ${pkgName} build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/backend/services/${serviceName}/dist ./backend/services/${serviceName}/dist
COPY --from=build /app/backend/services/${serviceName}/package.json ./backend/services/${serviceName}/
EXPOSE ${port}
CMD ["node", "backend/services/${serviceName}/dist/main.js"]
`,
);

console.log(`Scaffolded ${serviceName} at ${serviceDir}`);
