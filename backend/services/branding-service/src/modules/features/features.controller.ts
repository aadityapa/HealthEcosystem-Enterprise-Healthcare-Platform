import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { FeaturesService } from './features.service';
import { CreateFeatureDto, UpdateFeatureDto } from './dto/features.dto';

@ApiTags('Branding - Features')
@Controller('api/v1/branding/features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or upsert feature toggle' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateFeatureDto) {
    return this.featuresService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List feature toggles' })
  list(@ServiceContext() ctx: ServiceRequestContext) {
    return this.featuresService.list(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature toggle' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.featuresService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature toggle' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeatureDto,
  ) {
    return this.featuresService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feature toggle' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.featuresService.remove(ctx, id);
  }
}
