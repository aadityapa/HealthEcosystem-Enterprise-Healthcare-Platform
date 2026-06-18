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
import { MasterContext } from '@/common/decorators/master.decorators';
import type { MasterRequestContext } from '@/common/context/master-context';
import { CreatePackageDto, UpdatePackageDto, ListPackagesQueryDto } from './dto/packages.dto';
import {
  CreatePackageCommand,
  UpdatePackageCommand,
  GetPackageQuery,
  ListPackagesQuery,
} from './commands/packages.commands';

@ApiTags('Master Packages')
@Controller('api/v1/master/packages')
export class PackagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List packages' })
  listPackages(
    @MasterContext() ctx: MasterRequestContext,
    @Query() filters: ListPackagesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListPackagesQuery(ctx, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create package' })
  createPackage(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreatePackageDto) {
    return this.commandBus.execute(new CreatePackageCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package detail' })
  getPackage(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetPackageQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package' })
  updatePackage(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.commandBus.execute(new UpdatePackageCommand(ctx, id, dto));
  }
}
