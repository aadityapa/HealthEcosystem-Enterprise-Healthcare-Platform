import {
  Body,
  Controller,
  Delete,
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
import { PaginationDto } from '@/common/dto/pagination.dto';
import { VulnerabilitiesService } from './vulnerabilities.service';
import {
  CreateVulnerabilityScanDto,
  UpdateVulnerabilityScanDto,
} from './dto/vulnerabilities.dto';

@ApiTags('Security Vulnerabilities')
@Controller('api/v1/security/vulnerabilities')
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List vulnerability scans' })
  listScans(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: PaginationDto,
  ) {
    return this.vulnerabilitiesService.listScans(ctx, query);
  }

  @Get('findings')
  @ApiOperation({ summary: 'List vulnerability findings' })
  listFindings(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: PaginationDto,
    @Query('scanId') scanId?: string,
  ) {
    return this.vulnerabilitiesService.listFindings(ctx, query, scanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vulnerability scan by id' })
  getScan(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vulnerabilitiesService.getScan(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create vulnerability scan' })
  createScan(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateVulnerabilityScanDto,
  ) {
    return this.vulnerabilitiesService.createScan(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vulnerability scan' })
  updateScan(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVulnerabilityScanDto,
  ) {
    return this.vulnerabilitiesService.updateScan(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete vulnerability scan' })
  removeScan(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vulnerabilitiesService.removeScan(ctx, id);
  }
}
