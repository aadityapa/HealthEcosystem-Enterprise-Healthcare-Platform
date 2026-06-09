import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificates.dto';

@ApiTags('Security Certificates')
@Controller('api/v1/security/certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'List certificates with expiry alerts' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.certificatesService.list(ctx, query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get certificates expiring within 30 days' })
  getAlerts(@ServiceContext() ctx: ServiceRequestContext) {
    return this.certificatesService.getExpiryAlerts(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.certificatesService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register certificate' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.certificatesService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update certificate' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificatesService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete certificate' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.certificatesService.remove(ctx, id);
  }
}
