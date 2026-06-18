import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { MasterRequestContext } from '@/common/context/master-context';
import { MasterEventsService } from '@/common/services/master-events.service';
import { INDIAN_STATES } from './data/indian-states';

@Injectable()
export class GeographyService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async seedIndianStates(ctx: MasterRequestContext) {
    const results = await this.prisma.$transaction(async (tx) => {
      const seeded = [];

      for (const state of INDIAN_STATES) {
        const record = await tx.stateMaster.upsert({
          where: { code: state.code },
          create: {
            code: state.code,
            name: state.name,
            gstCode: state.gstCode,
          },
          update: {
            name: state.name,
            gstCode: state.gstCode,
            isActive: true,
          },
        });
        seeded.push(record);
      }

      return seeded;
    });

    await this.events.publishUpdated(ctx, 'StateMaster', 'seed', 'created', {
      count: results.length,
    });

    return { seeded: results.length, states: results };
  }

  listStates() {
    return this.prisma.stateMaster.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getState(stateId: string) {
    const state = await this.prisma.stateMaster.findUnique({ where: { id: stateId } });
    if (!state) throw new NotFoundException('State not found');
    return state;
  }

  async createState(
    ctx: MasterRequestContext,
    dto: { code: string; name: string; gstCode?: string },
  ) {
    const existing = await this.prisma.stateMaster.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`State code "${dto.code}" already exists`);
    }

    const state = await this.prisma.stateMaster.create({
      data: {
        code: dto.code,
        name: dto.name,
        gstCode: dto.gstCode,
      },
    });

    await this.events.publishUpdated(ctx, 'StateMaster', state.id, 'created', {
      code: state.code,
    });

    return state;
  }

  async updateState(
    ctx: MasterRequestContext,
    stateId: string,
    dto: { name?: string; gstCode?: string; isActive?: boolean },
  ) {
    await this.getState(stateId);

    const state = await this.prisma.stateMaster.update({
      where: { id: stateId },
      data: dto,
    });

    await this.events.publishUpdated(ctx, 'StateMaster', state.id, 'updated');

    return state;
  }

  async createCity(
    ctx: MasterRequestContext,
    dto: { stateId: string; code: string; name: string; pincode?: string },
  ) {
    await this.getState(dto.stateId);

    const existing = await this.prisma.cityMaster.findFirst({
      where: { stateId: dto.stateId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`City code "${dto.code}" already exists for this state`);
    }

    const city = await this.prisma.cityMaster.create({
      data: {
        stateId: dto.stateId,
        code: dto.code,
        name: dto.name,
        pincode: dto.pincode,
      },
      include: { state: true },
    });

    await this.events.publishUpdated(ctx, 'CityMaster', city.id, 'created', {
      stateId: dto.stateId,
    });

    return city;
  }

  async getCity(cityId: string) {
    const city = await this.prisma.cityMaster.findUnique({
      where: { id: cityId },
      include: { state: true },
    });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async listCities(filters: { stateId?: string; page?: number; limit?: number }) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      isActive: true,
      ...(filters.stateId && { stateId: filters.stateId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.cityMaster.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { state: true },
      }),
      this.prisma.cityMaster.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async updateCity(
    ctx: MasterRequestContext,
    cityId: string,
    dto: { name?: string; pincode?: string; isActive?: boolean },
  ) {
    await this.getCity(cityId);

    const city = await this.prisma.cityMaster.update({
      where: { id: cityId },
      data: dto,
      include: { state: true },
    });

    await this.events.publishUpdated(ctx, 'CityMaster', city.id, 'updated');

    return city;
  }
}
