import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createLogger } from '@health/logger';

async function bootstrap() {
  const logger = createLogger({ service: 'audit-service' });
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
    .setTitle('HealthEcosystem Audit Service')
    .setDescription('Immutable audit trail — append-only compliance logging')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-Internal-Service-Key', in: 'header' }, 'internal')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.AUDIT_SERVICE_PORT ?? 3005;
  await app.listen(port);
  logger.info(`Audit service running on port ${port}`);
}

bootstrap();
