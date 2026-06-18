import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { PERMISSIONS } from '@health/shared-types';
import { JwtAuthGuard, PermissionsGuard } from '@/common/guards/auth.guards';
import {
  CurrentUser,
  RequirePermissions,
  RequestContext,
} from '@/common/decorators/tenant.decorators';
import type { RequestContext as TenantRequestContext } from '@/common/decorators/tenant.decorators';
import type { JwtPayload } from '@health/shared-types';
import {
  RegisterPatientDto,
  UpdatePatientDto,
  RecordConsentDto,
  CreateVisitDto,
  LinkFamilyMemberDto,
  CreateDocumentDto,
  SearchPatientsDto,
} from './dto/patient.dto';
import {
  RegisterPatientCommand,
  UpdatePatientCommand,
  RecordConsentCommand,
  CreateVisitCommand,
  LinkFamilyMemberCommand,
  CreatePatientDocumentCommand,
} from './commands/patient.commands';
import {
  GetPatientQuery,
  SearchPatientsQuery,
  GetPatientTimelineQuery,
  GetPatientVisitsQuery,
  ListPatientDocumentsQuery,
} from './queries/patient.queries';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('api/v1/patients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.PATIENT.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new patient' })
  async register(
    @Body() dto: RegisterPatientDto,
    @RequestContext() ctx: TenantRequestContext,
  ) {
    const data = await this.commandBus.execute(
      new RegisterPatientCommand({ ...dto, ...ctx }),
    );
    return { success: true, data };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'List or search patients' })
  async list(@Query() query: SearchPatientsDto, @CurrentUser() user: JwtPayload) {
    const result = await this.queryBus.execute(
      new SearchPatientsQuery(
        user.tenantId,
        query.q,
        query.page ?? 1,
        query.limit ?? 20,
      ),
    );
    return {
      success: true,
      data: result.data,
      meta: { pagination: result.meta },
    };
  }

  @Get('search')
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'Search patients by name, phone, or UHID' })
  async search(@Query() query: SearchPatientsDto, @CurrentUser() user: JwtPayload) {
    const result = await this.queryBus.execute(
      new SearchPatientsQuery(
        user.tenantId,
        query.q,
        query.page ?? 1,
        query.limit ?? 20,
      ),
    );
    return {
      success: true,
      data: result.data,
      meta: { pagination: result.meta },
    };
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'Get patient 360 view' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.queryBus.execute(
      new GetPatientQuery(user.tenantId, id),
    );
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PATIENT.UPDATE)
  @ApiOperation({ summary: 'Update patient record' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
    @RequestContext() ctx: TenantRequestContext,
  ) {
    const data = await this.commandBus.execute(
      new UpdatePatientCommand({ ...dto, ...ctx, patientId: id }),
    );
    return { success: true, data };
  }

  @Get(':id/timeline')
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'Get patient timeline events' })
  async timeline(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SearchPatientsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.queryBus.execute(
      new GetPatientTimelineQuery(
        user.tenantId,
        id,
        query.page ?? 1,
        query.limit ?? 20,
      ),
    );
    return {
      success: true,
      data: result.data,
      meta: { pagination: result.meta },
    };
  }

  @Get(':id/visits')
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'Get patient visit history' })
  async visits(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SearchPatientsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.queryBus.execute(
      new GetPatientVisitsQuery(
        user.tenantId,
        id,
        query.page ?? 1,
        query.limit ?? 20,
      ),
    );
    return {
      success: true,
      data: result.data,
      meta: { pagination: result.meta },
    };
  }

  @Post(':id/documents')
  @RequirePermissions(PERMISSIONS.PATIENT.UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register uploaded patient document metadata' })
  async createDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDocumentDto,
    @RequestContext() ctx: TenantRequestContext,
  ) {
    const data = await this.commandBus.execute(
      new CreatePatientDocumentCommand({ ...dto, ...ctx, patientId: id }),
    );
    return { success: true, data };
  }

  @Get(':id/documents')
  @RequirePermissions(PERMISSIONS.PATIENT.READ)
  @ApiOperation({ summary: 'List patient documents' })
  async listDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.queryBus.execute(
      new ListPatientDocumentsQuery(user.tenantId, id),
    );
    return { success: true, data };
  }

  @Post(':id/consents')
  @RequirePermissions(PERMISSIONS.PATIENT.UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record patient consent' })
  async recordConsent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordConsentDto,
    @RequestContext() ctx: TenantRequestContext,
    @Req() req: Request,
  ) {
    const data = await this.commandBus.execute(
      new RecordConsentCommand({
        ...dto,
        ...ctx,
        patientId: id,
        ipAddress: req.ip,
      }),
    );
    return { success: true, data };
  }

  @Post(':id/family')
  @RequirePermissions(PERMISSIONS.PATIENT.UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a family member to patient' })
  async linkFamily(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkFamilyMemberDto,
    @RequestContext() ctx: TenantRequestContext,
  ) {
    const data = await this.commandBus.execute(
      new LinkFamilyMemberCommand({
        ...dto,
        ...ctx,
        patientId: id,
      }),
    );
    return { success: true, data };
  }

  @Post(':id/visits')
  @RequirePermissions(PERMISSIONS.PATIENT.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a patient visit' })
  async createVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVisitDto,
    @RequestContext() ctx: TenantRequestContext,
  ) {
    const data = await this.commandBus.execute(
      new CreateVisitCommand({ ...dto, ...ctx, patientId: id }),
    );
    return { success: true, data };
  }
}
