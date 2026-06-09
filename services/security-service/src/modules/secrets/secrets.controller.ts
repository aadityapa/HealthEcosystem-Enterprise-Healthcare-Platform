import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { SecretsService } from './secrets.service';
import { RotateSecretDto } from './dto/secrets.dto';

@ApiTags('Security Secrets')
@Controller('api/v1/security/secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get('rotate')
  @ApiOperation({ summary: 'List secret rotation logs' })
  listRotationLogs(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: PaginationDto,
  ) {
    return this.secretsService.listRotationLogs(ctx, query);
  }

  @Post('rotate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rotate a secret and log rotation' })
  rotate(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: RotateSecretDto,
  ) {
    return this.secretsService.rotate(ctx, dto);
  }
}
