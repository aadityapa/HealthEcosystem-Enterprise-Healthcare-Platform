import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { createLogger } from '@health/logger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';

async function bootstrap() {
  const logger = createLogger({ service: 'api-gateway' });
  const app = await NestFactory.create(AppModule, { logger: false, bodyParser: false });

  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string[]>('corsOrigins', ['http://localhost:3100']);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: ['x-request-id', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HealthEcosystem API Gateway')
    .setDescription('Unified entry point for HealthEcosystem microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = configService.get<number>('port', 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  logger.info(`API gateway running on port ${port}`);
}

bootstrap();
