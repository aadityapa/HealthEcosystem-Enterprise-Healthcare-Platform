import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, ListVendorsDto, UpdateVendorDto } from './dto/vendors.dto';

@ApiTags('Inventory Vendors')
@Controller('api/v1/inventory/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @ApiOperation({ summary: 'List vendors' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListVendorsDto) {
    return this.vendorsService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create vendor' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vendorsService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vendor' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(ctx, id, dto);
  }
}
