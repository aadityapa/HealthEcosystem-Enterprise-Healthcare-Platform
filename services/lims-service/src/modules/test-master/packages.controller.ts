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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { CreatePackageDto, UpdatePackageDto } from './dto/test-master.dto';
import {
  CreatePackageCommand,
  UpdatePackageCommand,
  GetPackageQuery,
  ListPackagesQuery,
} from './commands/test-master.commands';

@ApiTags('Packages')
@Controller('api/v1/lims/packages')
export class PackagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List packages' })
  listPackages(
    @LimsContext() ctx: LimsRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListPackagesQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create package' })
  createPackage(@LimsContext() ctx: LimsRequestContext, @Body() dto: CreatePackageDto) {
    return this.commandBus.execute(new CreatePackageCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package detail' })
  getPackage(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetPackageQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package' })
  updatePackage(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.commandBus.execute(new UpdatePackageCommand(ctx, id, dto));
  }
}
