import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createLogger } from '@health/logger';

async function bootstrap() {
  const logger = createLogger({ service: 'customer-success-service' });
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
    .setTitle('HealthEcosystem Customer-success Service')
    .setDescription('customer-success-service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.CUSTOMER_SUCCESS_SERVICE_PORT ?? 3029;
  await app.listen(port);
  logger.info(`customer-success-service running on port ${port}`);
}

bootstrap();
