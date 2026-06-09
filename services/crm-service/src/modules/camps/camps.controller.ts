import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CampsService } from './camps.service';
import {
  CreateCampDto,
  ListCampsQueryDto,
  RegisterCampPatientDto,
  UpdateCampDto,
} from './dto/camps.dto';

@ApiTags('CRM Camps')
@Controller('api/v1/crm/camps')
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  @Get()
  @ApiOperation({ summary: 'List health camps' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListCampsQueryDto,
  ) {
    return this.campsService.listCamps(ctx, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create health camp' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateCampDto,
  ) {
    return this.campsService.createCamp(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get camp by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campsService.getCamp(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update camp' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampDto,
  ) {
    return this.campsService.updateCamp(ctx, id, dto);
  }

  @Post(':id/registrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register patient to camp' })
  registerPatient(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegisterCampPatientDto,
  ) {
    return this.campsService.registerPatient(ctx, id, dto);
  }
}
