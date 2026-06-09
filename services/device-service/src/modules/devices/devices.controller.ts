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
import { DeviceContext } from '@/common/decorators/device.decorators';
import type { DeviceRequestContext } from '@/common/context/device-context';
import {
  RegisterDeviceDto,
  UpdateDeviceDto,
  ConfigureDeviceDto,
  ListDevicesQueryDto,
} from './dto/devices.dto';
import {
  RegisterDeviceCommand,
  UpdateDeviceCommand,
  ConfigureDeviceCommand,
} from './commands/devices.commands';
import {
  GetDeviceQuery,
  ListDevicesQuery,
  GetDeviceHealthQuery,
} from './queries/devices.queries';

@ApiTags('Devices')
@Controller('api/v1/devices')
export class DeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  health() {
    return { status: 'ok', service: 'device-service' };
  }

  @Post()
  @ApiOperation({ summary: 'Register a new device' })
  register(
    @DeviceContext() ctx: DeviceRequestContext,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.commandBus.execute(new RegisterDeviceCommand(ctx, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List devices' })
  list(
    @DeviceContext() ctx: DeviceRequestContext,
    @Query() filters: ListDevicesQueryDto,
  ) {
    return this.queryBus.execute(new ListDevicesQuery(ctx, filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  get(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetDeviceQuery(ctx, id));
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get device health metrics' })
  getHealth(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetDeviceHealthQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device' })
  update(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.commandBus.execute(new UpdateDeviceCommand(ctx, id, dto));
  }

  @Patch(':id/configure')
  @ApiOperation({ summary: 'Configure device connection and protocol' })
  configure(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigureDeviceDto,
  ) {
    return this.commandBus.execute(new ConfigureDeviceCommand(ctx, id, dto));
  }
}
