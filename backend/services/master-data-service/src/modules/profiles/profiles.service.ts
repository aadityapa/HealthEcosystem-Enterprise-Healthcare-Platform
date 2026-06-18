import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { MasterRequestContext } from '@/common/context/master-context';
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      description?: string;
      profilePrice: number;
      testIds?: string[];
      packageIds?: string[];
    },
  ) {
    const existing = await this.prisma.profileMaster.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Profile code "${dto.code}" already exists`);
    }

    const profile = await this.prisma.profileMaster.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        profilePrice: dto.profilePrice,
        testIds: (dto.testIds ?? []) as Prisma.InputJsonValue,
        packageIds: (dto.packageIds ?? []) as Prisma.InputJsonValue,
      },
    });

    await this.events.publishUpdated(ctx, 'ProfileMaster', profile.id, 'created', {
      code: profile.code,
    });

    return profile;
  }

  async get(ctx: MasterRequestContext, profileId: string) {
    const profile = await this.prisma.profileMaster.findFirst({
      where: { id: profileId, tenantId: ctx.tenantId },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async list(
    ctx: MasterRequestContext,
    filters: { isActive?: boolean; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.ProfileMasterWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.profileMaster.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.profileMaster.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    profileId: string,
    dto: {
      name?: string;
      description?: string;
      profilePrice?: number;
      testIds?: string[];
      packageIds?: string[];
      isActive?: boolean;
    },
  ) {
    await this.get(ctx, profileId);

    const profile = await this.prisma.profileMaster.update({
      where: { id: profileId, tenantId: ctx.tenantId },
      data: {
        ...dto,
        ...(dto.testIds !== undefined && {
          testIds: dto.testIds as Prisma.InputJsonValue,
        }),
        ...(dto.packageIds !== undefined && {
          packageIds: dto.packageIds as Prisma.InputJsonValue,
        }),
      },
    });

    await this.events.publishUpdated(ctx, 'ProfileMaster', profile.id, 'updated');

    return profile;
  }
}
