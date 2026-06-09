import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CollectionStatus, Prisma, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateStopDto,
  SubmitCollectionProofDto,
  UpdateStopStatusDto,
} from './dto/stops.dto';

@Injectable()
export class StopsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async addToRoute(ctx: ServiceRequestContext, routeId: string, dto: CreateStopDto) {
    const route = await this.prisma.fieldRoute.findFirst({
      where: { id: routeId, tenantId: ctx.tenantId },
      include: { stops: true },
    });
    if (!route) throw new NotFoundException('Route not found');
    if (route.status !== 'PLANNED') {
      throw new BadRequestException('Cannot add stops to a route that has started');
    }

    const nextOrder = route.stops.length + 1;
    const stop = await this.prisma.routeStop.create({
      data: {
        routeId,
        stopOrder: nextOrder,
        patientId: dto.patientId,
        patientName: dto.patientName,
        address: (dto.address ?? {}) as Prisma.InputJsonValue,
        lat: dto.lat,
        lng: dto.lng,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        orderId: dto.orderId,
        notes: dto.notes,
      },
      include: { proof: true },
    });

    await this.prisma.fieldRoute.update({
      where: { id: routeId },
      data: { totalStops: nextOrder },
    });

    return stop;
  }

  async get(ctx: ServiceRequestContext, id: string) {
    const stop = await this.prisma.routeStop.findFirst({
      where: { id, route: { tenantId: ctx.tenantId } },
      include: { proof: true, route: { include: { phlebotomist: true } } },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    return stop;
  }

  async updateStatus(ctx: ServiceRequestContext, id: string, dto: UpdateStopStatusDto) {
    const stop = await this.get(ctx, id);
    const now = new Date();

    const data: Prisma.RouteStopUpdateInput = {
      status: dto.status,
      notes: dto.notes ?? stop.notes,
    };

    if (dto.status === CollectionStatus.ARRIVED) {
      data.arrivedAt = now;
    }
    if (dto.status === CollectionStatus.COLLECTED) {
      data.collectedAt = now;
    }

    const updated = await this.prisma.routeStop.update({
      where: { id },
      data,
      include: { proof: true },
    });

    if (dto.status === CollectionStatus.COLLECTED) {
      const collected = await this.prisma.routeStop.count({
        where: { routeId: stop.routeId, status: CollectionStatus.COLLECTED },
      });
      await this.prisma.fieldRoute.update({
        where: { id: stop.routeId },
        data: { completedStops: collected },
      });
    }

    return updated;
  }

  async submitProof(ctx: ServiceRequestContext, id: string, dto: SubmitCollectionProofDto) {
    const stop = await this.get(ctx, id);

    if (!dto.photoUrl && !dto.signatureUrl && !dto.otpVerified && !dto.barcodeScanned) {
      throw new BadRequestException(
        'At least one proof type (photo, signature, OTP, or barcode) is required',
      );
    }

    const proof = await this.prisma.collectionProof.upsert({
      where: { stopId: id },
      create: {
        stopId: id,
        photoUrl: dto.photoUrl,
        signatureUrl: dto.signatureUrl,
        otpVerified: dto.otpVerified ?? false,
        barcodeScanned: dto.barcodeScanned,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        photoUrl: dto.photoUrl,
        signatureUrl: dto.signatureUrl,
        otpVerified: dto.otpVerified ?? false,
        barcodeScanned: dto.barcodeScanned,
        metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : undefined,
        collectedAt: new Date(),
      },
    });

    await this.updateStatus(ctx, id, { status: CollectionStatus.COLLECTED });

    return { stopId: id, proof };
  }
}
