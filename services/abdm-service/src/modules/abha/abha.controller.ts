import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AbhaService } from './abha.service';
import { LinkAbhaDto, ListAbhaQueryDto, VerifyAbhaDto } from './dto/abha.dto';

@ApiTags('ABDM ABHA')
@Controller('api/v1/abdm/abha')
export class AbhaController {
  constructor(private readonly abhaService: AbhaService) {}

  @Get()
  @ApiOperation({ summary: 'List ABHA profiles' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListAbhaQueryDto,
  ) {
    return this.abhaService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post('link')
  @ApiOperation({ summary: 'Link ABHA to patient' })
  link(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: LinkAbhaDto) {
    return this.abhaService.link(ctx, dto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get ABHA profile by patient ID' })
  getByPatient(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.abhaService.getByPatient(ctx, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ABHA profile by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.abhaService.get(ctx, id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify ABHA profile' })
  verify(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyAbhaDto,
  ) {
    return this.abhaService.verify(ctx, id, dto);
  }
}
