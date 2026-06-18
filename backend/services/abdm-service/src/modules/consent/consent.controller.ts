import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ConsentService } from './consent.service';
import {
  GrantConsentDto,
  ListConsentQueryDto,
  RequestConsentDto,
  RevokeConsentDto,
} from './dto/consent.dto';

@ApiTags('ABDM Consent')
@Controller('api/v1/abdm/consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get()
  @ApiOperation({ summary: 'List consent artifacts' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListConsentQueryDto,
  ) {
    return this.consentService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post('request')
  @ApiOperation({ summary: 'Request patient consent' })
  request(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: RequestConsentDto) {
    return this.consentService.request(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consent artifact by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.consentService.get(ctx, id);
  }

  @Post(':consentId/grant')
  @ApiOperation({ summary: 'Grant consent' })
  grant(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('consentId') consentId: string,
    @Body() dto: GrantConsentDto,
  ) {
    return this.consentService.grant(ctx, consentId, dto);
  }

  @Post(':consentId/revoke')
  @ApiOperation({ summary: 'Revoke consent' })
  revoke(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('consentId') consentId: string,
    @Body() dto: RevokeConsentDto,
  ) {
    return this.consentService.revoke(ctx, consentId, dto);
  }
}
