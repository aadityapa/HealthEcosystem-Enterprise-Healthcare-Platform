import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto, UpdateOnboardingDto } from './dto/onboarding.dto';

@ApiTags('Customer Success Onboarding')
@Controller('api/v1/customer-success/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant onboarding wizard state' })
  get(@ServiceContext() ctx: ServiceRequestContext) {
    return this.onboardingService.get(ctx);
  }

  @Post()
  @ApiOperation({ summary: 'Start tenant onboarding' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateOnboardingDto) {
    return this.onboardingService.create(ctx, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update onboarding checklist and progress' })
  update(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: UpdateOnboardingDto) {
    return this.onboardingService.update(ctx, dto);
  }
}
