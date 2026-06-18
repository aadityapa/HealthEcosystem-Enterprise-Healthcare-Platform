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
import { PoliciesService } from './policies.service';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policies.dto';

@ApiTags('Compliance Policies')
@Controller('api/v1/compliance/policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'List policy documents' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.policiesService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policiesService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create policy document' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreatePolicyDto,
  ) {
    return this.policiesService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update policy document' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    return this.policiesService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete policy document' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policiesService.remove(ctx, id);
  }
}
