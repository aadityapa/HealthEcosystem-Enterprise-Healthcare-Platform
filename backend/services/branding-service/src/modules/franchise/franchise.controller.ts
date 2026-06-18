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
import { FranchiseService } from './franchise.service';
import { CreateFranchiseBrandDto, UpdateFranchiseBrandDto } from './dto/franchise.dto';

@ApiTags('Branding - Franchise')
@Controller('api/v1/branding/franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post()
  @ApiOperation({ summary: 'Create franchise branch brand' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateFranchiseBrandDto) {
    return this.franchiseService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List franchise branch brands' })
  list(@ServiceContext() ctx: ServiceRequestContext) {
    return this.franchiseService.list(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get franchise branch brand' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.franchiseService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update franchise branch brand' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFranchiseBrandDto,
  ) {
    return this.franchiseService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete franchise branch brand' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.franchiseService.remove(ctx, id);
  }
}
