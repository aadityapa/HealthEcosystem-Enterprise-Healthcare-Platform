import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createLogger } from '@health/logger';

async function bootstrap() {
  const logger = createLogger({ service: 'master-data-service' });
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
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3100'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('HealthEcosystem Master Data Service')
    .setDescription(
      'Central master data API for tests, packages, profiles, rate cards, tax, billing codes, geography, specialties, departments, and device catalog',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .addApiKey({ type: 'apiKey', name: 'x-organization-id', in: 'header' }, 'organization-id')
    .addApiKey({ type: 'apiKey', name: 'x-branch-id', in: 'header' }, 'branch-id')
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'user-id')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.MASTER_DATA_SERVICE_PORT ?? 3007;
  await app.listen(port);
  logger.info(`Master data service running on port ${port}`);
}

bootstrap();
