import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto, ListReferralsQueryDto } from './dto/referrals.dto';

@ApiTags('CRM Referrals')
@Controller('api/v1/crm/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  @ApiOperation({ summary: 'List doctor referrals' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListReferralsQueryDto,
  ) {
    return this.referralsService.listReferrals(ctx, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create referral with commission calculation' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateReferralDto,
  ) {
    return this.referralsService.createReferral(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get referral by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.referralsService.getReferral(ctx, id);
  }
}
