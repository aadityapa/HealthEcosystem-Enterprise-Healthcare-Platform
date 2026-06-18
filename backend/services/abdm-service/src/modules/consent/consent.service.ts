import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConsentRequestStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AbdmSequenceService } from '@/services/abdm-sequence.service';
import type {
  GrantConsentDto,
  ListConsentQueryDto,
  RequestConsentDto,
  RevokeConsentDto,
} from './dto/consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequence: AbdmSequenceService,
  ) {}

  async request(ctx: ServiceRequestContext, dto: RequestConsentDto) {
    return this.prisma.consentArtifact.create({
      data: {
        tenantId: ctx.tenantId,
        patientId: dto.patientId,
        abhaNumber: dto.abhaNumber,
        consentId: this.sequence.next('CONSENT'),
        purpose: dto.purpose,
        hiTypes: dto.hiTypes,
        dateFrom: new Date(dto.dateFrom),
        dateTo: new Date(dto.dateTo),
        status: ConsentRequestStatus.REQUESTED,
      },
    });
  }

  async grant(ctx: ServiceRequestContext, consentId: string, dto: GrantConsentDto) {
    const consent = await this.getByConsentId(ctx, consentId);
    if (consent.status !== ConsentRequestStatus.REQUESTED) {
      throw new BadRequestException('Consent is not in requested state');
    }

    return this.prisma.consentArtifact.update({
      where: { id: consent.id },
      data: {
        status: ConsentRequestStatus.GRANTED,
        grantedAt: new Date(),
        artefactId: dto.artefactId ?? this.sequence.next('ART'),
      },
    });
  }

  async revoke(ctx: ServiceRequestContext, consentId: string, _dto: RevokeConsentDto) {
    const consent = await this.getByConsentId(ctx, consentId);
    if (consent.status === ConsentRequestStatus.REVOKED) {
      throw new BadRequestException('Consent is already revoked');
    }

    return this.prisma.consentArtifact.update({
      where: { id: consent.id },
      data: { status: ConsentRequestStatus.REVOKED },
    });
  }

  async get(ctx: ServiceRequestContext, id: string) {
    const consent = await this.prisma.consentArtifact.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!consent) throw new NotFoundException('Consent artifact not found');
    return consent;
  }

  async getByConsentId(ctx: ServiceRequestContext, consentId: string) {
    const consent = await this.prisma.consentArtifact.findFirst({
      where: { consentId, tenantId: ctx.tenantId },
    });
    if (!consent) throw new NotFoundException('Consent artifact not found');
    return consent;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListConsentQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.ConsentArtifactWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.patientId && { patientId: filters.patientId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.consentArtifact.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.consentArtifact.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
