import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FhirResourceType } from '@health/db';
import { PaginationDto } from '@health/validation';
import { OptionalServiceContext } from '@/common/decorators/optional-context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { FhirService } from './fhir.service';
import {
  CreateFhirResourceDto,
  FhirBundleDto,
  ListFhirQueryDto,
} from './dto/fhir.dto';

@ApiTags('ABDM FHIR')
@Controller('api/v1/abdm/fhir')
export class FhirController {
  constructor(private readonly fhirService: FhirService) {}

  private resolveContext(
    ctx: ServiceRequestContext | undefined,
    tenantId?: string,
  ): ServiceRequestContext {
    if (ctx) return ctx;
    if (tenantId) {
      return {
        tenantId,
        organizationId: tenantId,
        branchId: tenantId,
        userId: 'system',
      };
    }
    throw new BadRequestException('tenantId is required for public FHIR access');
  }

  @Get()
  @ApiOperation({ summary: 'List FHIR resources' })
  @ApiQuery({ name: 'tenantId', required: false })
  list(
    @OptionalServiceContext() ctx: ServiceRequestContext | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Query() pagination: PaginationDto,
    @Query() filters: ListFhirQueryDto,
  ) {
    return this.fhirService.list(this.resolveContext(ctx, tenantId), {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create or update FHIR resource' })
  @ApiQuery({ name: 'tenantId', required: false })
  create(
    @OptionalServiceContext() ctx: ServiceRequestContext | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Body() dto: CreateFhirResourceDto,
  ) {
    return this.fhirService.create(this.resolveContext(ctx, tenantId), dto);
  }

  @Post('Bundle')
  @ApiOperation({ summary: 'Ingest FHIR R4 Bundle' })
  @ApiQuery({ name: 'tenantId', required: false })
  ingestBundle(
    @OptionalServiceContext() ctx: ServiceRequestContext | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Body() dto: FhirBundleDto,
  ) {
    return this.fhirService.ingestBundle(this.resolveContext(ctx, tenantId), dto);
  }

  @Get(':resourceType/:resourceId')
  @ApiOperation({ summary: 'Get FHIR resource by type and ID' })
  @ApiQuery({ name: 'tenantId', required: false })
  get(
    @OptionalServiceContext() ctx: ServiceRequestContext | undefined,
    @Query('tenantId') tenantId: string | undefined,
    @Param('resourceType') resourceType: FhirResourceType,
    @Param('resourceId') resourceId: string,
  ) {
    return this.fhirService.get(
      this.resolveContext(ctx, tenantId),
      resourceType,
      resourceId,
    );
  }
}
