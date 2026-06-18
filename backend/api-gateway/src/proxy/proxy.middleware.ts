import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, fixRequestBody, type RequestHandler } from 'http-proxy-middleware';
import type { GatewayConfig, ServiceTarget } from '@/config/configuration';
import { REQUEST_ID_HEADER } from '@/common/constants';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly handlers: Array<{ prefixes: string[]; handler: RequestHandler }>;

  constructor(private readonly configService: ConfigService) {
    const services = this.configService.get<GatewayConfig['services']>('services', []);
    this.handlers = services.map((service) => ({
      prefixes: service.pathPrefixes,
      handler: this.createHandler(service),
    }));
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const pathname = req.originalUrl.split('?')[0] ?? req.path;
    const match = this.handlers.find(({ prefixes }) =>
      prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    );

    if (!match) {
      next(new NotFoundException(`No upstream service registered for ${pathname}`));
      return;
    }

    match.handler(req, res, next);
  }

  private createHandler(service: ServiceTarget): RequestHandler {
    return createProxyMiddleware({
      target: service.baseUrl,
      changeOrigin: true,
      xfwd: true,
      proxyTimeout: 30_000,
      timeout: 30_000,
      on: {
        proxyReq: (proxyReq, req) => {
          const requestId = req.headers[REQUEST_ID_HEADER];
          if (typeof requestId === 'string') {
            proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
          }

          fixRequestBody(proxyReq, req);
        },
        error: (_error, _req, res) => {
          if ('writeHead' in res && typeof res.writeHead === 'function') {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: false,
                error: {
                  code: 'BAD_GATEWAY',
                  message: `Upstream ${service.name} is unavailable`,
                },
              }),
            );
          }
        },
      },
    });
  }
}
