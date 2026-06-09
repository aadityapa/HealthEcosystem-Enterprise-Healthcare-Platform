import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-internal-service-key'];
    const expectedKey = this.config.get<string>('INTERNAL_SERVICE_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException('Internal service authentication is not configured');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service credentials');
    }

    return true;
  }
}
