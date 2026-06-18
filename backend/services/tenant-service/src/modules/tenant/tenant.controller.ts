import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreateTenantDto,
  CreateOrganizationDto,
  CreateBranchDto,
  CreateDepartmentDto,
  CreateFranchiseAgreementDto,
  ListBranchesQueryDto,
  GetBranchTreeQueryDto,
} from './dto/tenant.dto';
import {
  CreateTenantCommand,
  CreateOrganizationCommand,
  CreateBranchCommand,
  CreateDepartmentCommand,
  CreateFranchiseAgreementCommand,
} from './commands/tenant.commands';
import {
  GetTenantQuery,
  ListBranchesQuery,
  GetBranchTreeQuery,
} from './queries/tenant.queries';

@ApiTags('Tenants')
@Controller('api/v1/tenants')
export class TenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant' })
  async createTenant(@Body() dto: CreateTenantDto) {
    const data = await this.commandBus.execute(new CreateTenantCommand(dto));
    return { success: true, data };
  }

  @Get('health')
  health() {
    return { success: true, data: { status: 'ok', service: 'tenant-service' } };
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get tenant by ID or slug' })
  async getTenant(@Param('identifier') identifier: string) {
    const data = await this.queryBus.execute(new GetTenantQuery(identifier));
    return { success: true, data };
  }
}

@ApiTags('Organizations')
@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization under a tenant' })
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    const data = await this.commandBus.execute(new CreateOrganizationCommand(dto));
    return { success: true, data };
  }
}

@ApiTags('Branches')
@Controller('api/v1/branches')
export class BranchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create branch under an organization' })
  async createBranch(@Body() dto: CreateBranchDto) {
    const data = await this.commandBus.execute(new CreateBranchCommand(dto));
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List branches for a tenant' })
  async listBranches(@Query() query: ListBranchesQueryDto) {
    const data = await this.queryBus.execute(new ListBranchesQuery(query));
    return { success: true, data: data.items, meta: data.meta };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get hierarchical branch tree' })
  async getBranchTree(@Query() query: GetBranchTreeQueryDto) {
    const data = await this.queryBus.execute(new GetBranchTreeQuery(query));
    return { success: true, data };
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create department under a branch' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    const data = await this.commandBus.execute(new CreateDepartmentCommand(dto));
    return { success: true, data };
  }

  @Post('franchise-agreements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create franchise agreement between branches' })
  async createFranchiseAgreement(@Body() dto: CreateFranchiseAgreementDto) {
    const data = await this.commandBus.execute(new CreateFranchiseAgreementCommand(dto));
    return { success: true, data };
  }
}
