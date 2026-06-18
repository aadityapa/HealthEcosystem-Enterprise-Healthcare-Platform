import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/subscriptions.dto';

@ApiTags('Commercial Subscriptions')
@Controller('api/v1/commercial/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant subscription' })
  get(@ServiceContext() ctx: ServiceRequestContext) {
    return this.subscriptionsService.get(ctx);
  }

  @Post()
  @ApiOperation({ summary: 'Create tenant subscription license' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(ctx, dto);
  }
}
