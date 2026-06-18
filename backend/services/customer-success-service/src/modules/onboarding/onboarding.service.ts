import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnboardingStatus, Prisma, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateOnboardingDto, UpdateOnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async get(ctx: ServiceRequestContext) {
    const onboarding = await this.prisma.tenantOnboarding.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (!onboarding) throw new NotFoundException('Onboarding record not found');
    return onboarding;
  }

  async create(ctx: ServiceRequestContext, dto: CreateOnboardingDto) {
    const existing = await this.prisma.tenantOnboarding.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (existing) throw new ConflictException('Onboarding already exists for tenant');

    return this.prisma.tenantOnboarding.create({
      data: {
        tenantId: ctx.tenantId,
        status: OnboardingStatus.NOT_STARTED,
        currentStep: dto.currentStep,
        assignedCsm: dto.assignedCsm,
        targetGoLive: dto.targetGoLive ? new Date(dto.targetGoLive) : undefined,
        checklist: (dto.checklist ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async update(ctx: ServiceRequestContext, dto: UpdateOnboardingDto) {
    await this.get(ctx);

    const completedAt =
      dto.status === OnboardingStatus.COMPLETED ? new Date() : undefined;

    const { checklist, targetGoLive, ...rest } = dto;

    return this.prisma.tenantOnboarding.update({
      where: { tenantId: ctx.tenantId },
      data: {
        ...rest,
        ...(checklist !== undefined && { checklist: checklist as Prisma.InputJsonValue }),
        targetGoLive: targetGoLive ? new Date(targetGoLive) : undefined,
        completedAt,
      },
    });
  }
}
