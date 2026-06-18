import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createLogger } from '@health/logger';

async function bootstrap() {
  const logger = createLogger({ service: 'abdm-service' });
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
    .setTitle('HealthEcosystem Abdm Service')
    .setDescription('abdm-service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.ABDM_SERVICE_PORT ?? 3013;
  await app.listen(port);
  logger.info(`abdm-service running on port ${port}`);
}

bootstrap();
