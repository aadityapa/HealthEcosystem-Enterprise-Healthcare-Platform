import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { StopsService } from './stops.service';
import {
  CreateStopDto,
  SubmitCollectionProofDto,
  UpdateStopStatusDto,
} from './dto/stops.dto';

@ApiTags('Route Stops')
@Controller('api/v1/field')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Post('routes/:routeId/stops')
  @ApiOperation({ summary: 'Add stop to route' })
  addToRoute(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.stopsService.addToRoute(ctx, routeId, dto);
  }

  @Get('stops/:id')
  @ApiOperation({ summary: 'Get stop by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stopsService.get(ctx, id);
  }

  @Patch('stops/:id/status')
  @ApiOperation({ summary: 'Update stop collection status' })
  updateStatus(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStopStatusDto,
  ) {
    return this.stopsService.updateStatus(ctx, id, dto);
  }

  @Post('stops/:id/proof')
  @ApiOperation({ summary: 'Submit collection proof (photo/signature/otp/barcode)' })
  submitProof(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitCollectionProofDto,
  ) {
    return this.stopsService.submitProof(ctx, id, dto);
  }
}
