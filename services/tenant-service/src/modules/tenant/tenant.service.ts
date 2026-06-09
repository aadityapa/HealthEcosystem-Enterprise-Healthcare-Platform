import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type {
  PrismaClient,
  Branch,
  BranchType,
  Tenant,
  Organization,
  Department,
  FranchiseAgreement,
  Prisma,
} from '@health/db';
import { PRISMA } from '@/database/database.module';
import { createEvent } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { paginate, paginationMeta } from '@health/validation';
import type {
  CreateTenantDto,
  CreateOrganizationDto,
  CreateBranchDto,
  CreateDepartmentDto,
  CreateFranchiseAgreementDto,
  ListBranchesQueryDto,
  GetBranchTreeQueryDto,
  BranchTreeNode,
  TenantDetailResponse,
} from './dto/tenant.dto';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Tenant with slug "${dto.slug}" already exists`);
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        tier: dto.tier,
        status: dto.status,
        settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
        dataRegion: dto.dataRegion,
      },
    });

    createEvent(
      EVENT_TYPES.TENANT_CREATED,
      'Tenant',
      tenant.id,
      tenant.id,
      {
        tenantId: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        tier: tenant.tier,
      },
    );

    return tenant;
  }

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    await this.assertTenantExists(dto.tenantId);

    if (dto.gstin) {
      const existing = await this.prisma.organization.findFirst({
        where: { tenantId: dto.tenantId, gstin: dto.gstin },
      });
      if (existing) {
        throw new ConflictException(
          `Organization with GSTIN "${dto.gstin}" already exists for this tenant`,
        );
      }
    }

    return this.prisma.organization.create({
      data: {
        tenantId: dto.tenantId,
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        gstin: dto.gstin,
        pan: dto.pan,
        orgType: dto.orgType ?? 'diagnostic',
        settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async createBranch(dto: CreateBranchDto): Promise<Branch> {
    await this.assertOrganizationBelongsToTenant(dto.tenantId, dto.organizationId);

    if (dto.parentBranchId) {
      await this.assertBranchBelongsToTenantOrg(
        dto.tenantId,
        dto.organizationId,
        dto.parentBranchId,
      );
    }

    const existing = await this.prisma.branch.findFirst({
      where: { tenantId: dto.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Branch with code "${dto.code}" already exists for this tenant`,
      );
    }

    const branch = await this.prisma.branch.create({
      data: {
        tenantId: dto.tenantId,
        organizationId: dto.organizationId,
        parentBranchId: dto.parentBranchId,
        code: dto.code,
        name: dto.name,
        branchType: dto.branchType,
        address: (dto.address ?? {}) as Prisma.InputJsonValue,
        contact: (dto.contact ?? {}) as Prisma.InputJsonValue,
        isCollectionCenter: dto.isCollectionCenter ?? dto.branchType === 'COLLECTION_CENTER',
        isProcessingLab: dto.isProcessingLab ?? dto.branchType === 'PROCESSING_LAB',
        timezone: dto.timezone ?? 'Asia/Kolkata',
      },
    });

    createEvent(
      EVENT_TYPES.BRANCH_CREATED,
      'Branch',
      branch.id,
      dto.tenantId,
      {
        branchId: branch.id,
        organizationId: dto.organizationId,
        code: branch.code,
        name: branch.name,
        branchType: branch.branchType,
      },
      { organizationId: dto.organizationId, branchId: branch.id },
    );

    return branch;
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    await this.assertBranchBelongsToTenantOrg(
      dto.tenantId,
      dto.organizationId,
      dto.branchId,
    );

    const existing = await this.prisma.department.findFirst({
      where: {
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        code: dto.code,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Department with code "${dto.code}" already exists for this branch`,
      );
    }

    return this.prisma.department.create({
      data: {
        tenantId: dto.tenantId,
        organizationId: dto.organizationId,
        branchId: dto.branchId,
        code: dto.code,
        name: dto.name,
      },
    });
  }

  async createFranchiseAgreement(dto: CreateFranchiseAgreementDto): Promise<FranchiseAgreement> {
    await this.assertOrganizationBelongsToTenant(dto.tenantId, dto.organizationId);

    const franchiseBranch = await this.assertBranchBelongsToTenantOrg(
      dto.tenantId,
      dto.organizationId,
      dto.franchiseBranchId,
    );

    const parentBranch = await this.assertBranchBelongsToTenantOrg(
      dto.tenantId,
      dto.organizationId,
      dto.parentBranchId,
    );

    if (franchiseBranch.id === parentBranch.id) {
      throw new BadRequestException('Franchise branch and parent branch must be different');
    }

    if (franchiseBranch.branchType !== 'FRANCHISE') {
      throw new BadRequestException('Franchise branch must have branchType FRANCHISE');
    }

    const existing = await this.prisma.franchiseAgreement.findFirst({
      where: { tenantId: dto.tenantId, agreementNumber: dto.agreementNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Franchise agreement "${dto.agreementNumber}" already exists for this tenant`,
      );
    }

    return this.prisma.franchiseAgreement.create({
      data: {
        tenantId: dto.tenantId,
        organizationId: dto.organizationId,
        franchiseBranchId: dto.franchiseBranchId,
        parentBranchId: dto.parentBranchId,
        agreementNumber: dto.agreementNumber,
        revenueSharePct: dto.revenueSharePct,
        canSetPricing: dto.canSetPricing ?? false,
        canProcessLocal: dto.canProcessLocal ?? false,
        canReleaseReports: dto.canReleaseReports ?? false,
        brandingConfig: (dto.brandingConfig ?? {}) as Prisma.InputJsonValue,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        status: dto.status ?? 'active',
      },
    });
  }

  async getTenant(identifier: string): Promise<TenantDetailResponse> {
    const isUuid = UUID_REGEX.test(identifier);

    const tenant = await this.prisma.tenant.findFirst({
      where: isUuid ? { id: identifier } : { slug: identifier },
      include: {
        organizations: {
          select: { id: true, legalName: true, tradeName: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${identifier}" not found`);
    }

    return tenant;
  }

  async listBranches(query: ListBranchesQueryDto): Promise<{
    items: Branch[];
    meta: ReturnType<typeof paginationMeta>;
  }> {
    await this.assertTenantExists(query.tenantId);

    if (query.organizationId) {
      await this.assertOrganizationBelongsToTenant(query.tenantId, query.organizationId);
    }

    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where = {
      tenantId: query.tenantId,
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.branchType ? { branchType: query.branchType } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.parentBranchId !== undefined
        ? { parentBranchId: query.parentBranchId }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async getBranchTree(query: GetBranchTreeQueryDto): Promise<BranchTreeNode[]> {
    await this.assertTenantExists(query.tenantId);

    if (query.organizationId) {
      await this.assertOrganizationBelongsToTenant(query.tenantId, query.organizationId);
    }

    const branches = await this.prisma.branch.findMany({
      where: {
        tenantId: query.tenantId,
        ...(query.organizationId ? { organizationId: query.organizationId } : {}),
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    if (query.rootBranchId) {
      const root = branches.find((b) => b.id === query.rootBranchId);
      if (!root) {
        throw new NotFoundException(`Root branch "${query.rootBranchId}" not found`);
      }
      return [this.buildBranchNode(root, branches)];
    }

    return this.buildBranchForest(branches);
  }

  private buildBranchForest(branches: Branch[]): BranchTreeNode[] {
    const nodeMap = new Map<string, BranchTreeNode>();

    for (const branch of branches) {
      nodeMap.set(branch.id, this.toBranchNode(branch));
    }

    const roots: BranchTreeNode[] = [];

    for (const branch of branches) {
      const node = nodeMap.get(branch.id)!;
      if (branch.parentBranchId && nodeMap.has(branch.parentBranchId)) {
        nodeMap.get(branch.parentBranchId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private buildBranchNode(root: Branch, branches: Branch[]): BranchTreeNode {
    const node = this.toBranchNode(root);
    const children = branches.filter((b) => b.parentBranchId === root.id);
    node.children = children.map((child) => this.buildBranchNode(child, branches));
    return node;
  }

  private toBranchNode(branch: Branch): BranchTreeNode {
    return {
      id: branch.id,
      tenantId: branch.tenantId,
      organizationId: branch.organizationId,
      parentBranchId: branch.parentBranchId,
      code: branch.code,
      name: branch.name,
      branchType: branch.branchType as BranchType,
      isActive: branch.isActive,
      children: [],
    };
  }

  private async assertTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" not found`);
    }
  }

  private async assertOrganizationBelongsToTenant(
    tenantId: string,
    organizationId: string,
  ): Promise<void> {
    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId, tenantId },
    });
    if (!organization) {
      throw new NotFoundException(
        `Organization "${organizationId}" not found for tenant "${tenantId}"`,
      );
    }
  }

  private async assertBranchBelongsToTenantOrg(
    tenantId: string,
    organizationId: string,
    branchId: string,
  ) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId, organizationId },
    });
    if (!branch) {
      throw new NotFoundException(
        `Branch "${branchId}" not found for organization "${organizationId}"`,
      );
    }
    return branch;
  }
}
