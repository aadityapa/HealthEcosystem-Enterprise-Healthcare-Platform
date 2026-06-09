import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus, type PrismaClient } from '@health/db';
import { randomBytes } from 'crypto';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateSubscriptionDto } from './dto/subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private generateLicenseKey(): string {
    return randomBytes(16).toString('hex').toUpperCase();
  }

  async get(ctx: ServiceRequestContext) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId: ctx.tenantId },
      include: { plan: true },
    });
    if (!subscription) throw new NotFoundException('Tenant subscription not found');
    return subscription;
  }

  async create(ctx: ServiceRequestContext, dto: CreateSubscriptionDto) {
    const existing = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (existing) throw new ConflictException('Tenant already has a subscription');

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Subscription plan not found');
    }

    return this.prisma.tenantSubscription.create({
      data: {
        tenantId: ctx.tenantId,
        planId: dto.planId,
        status: dto.status ?? SubscriptionStatus.TRIAL,
        seats: dto.seats ?? 5,
        licenseKey: this.generateLicenseKey(),
        mrr: plan.monthlyPrice,
      },
      include: { plan: true },
    });
  }
}
