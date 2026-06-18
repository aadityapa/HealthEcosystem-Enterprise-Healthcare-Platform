import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FhirResourceType, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateFhirResourceDto,
  FhirBundleDto,
  ListFhirQueryDto,
} from './dto/fhir.dto';

interface FhirBundleEntry {
  resource?: {
    resourceType?: string;
    id?: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class FhirService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateFhirResourceDto) {
    return this.prisma.fhirResource.upsert({
      where: {
        tenantId_resourceType_resourceId: {
          tenantId: ctx.tenantId,
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
        },
      },
      create: {
        tenantId: ctx.tenantId,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        patientId: dto.patientId,
        content: dto.content as Prisma.InputJsonValue,
        publishedAt: new Date(),
      },
      update: {
        patientId: dto.patientId,
        content: dto.content as Prisma.InputJsonValue,
        version: { increment: 1 },
        publishedAt: new Date(),
      },
    });
  }

  async get(
    ctx: ServiceRequestContext,
    resourceType: FhirResourceType,
    resourceId: string,
  ) {
    const resource = await this.prisma.fhirResource.findFirst({
      where: {
        tenantId: ctx.tenantId,
        resourceType,
        resourceId,
      },
    });
    if (!resource) throw new NotFoundException('FHIR resource not found');
    return resource;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListFhirQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.FhirResourceWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.resourceType && { resourceType: filters.resourceType }),
      ...(filters.patientId && { patientId: filters.patientId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.fhirResource.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.fhirResource.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async ingestBundle(ctx: ServiceRequestContext, dto: FhirBundleDto) {
    const bundle = dto.bundle;
    if (bundle.resourceType !== 'Bundle') {
      throw new BadRequestException('Payload must be a FHIR R4 Bundle');
    }

    const entries = (bundle.entry as FhirBundleEntry[] | undefined) ?? [];
    const results = [];

    for (const entry of entries) {
      const resource = entry.resource;
      if (!resource?.resourceType || !resource.id) continue;

      const resourceType = this.mapResourceType(resource.resourceType);
      if (!resourceType) continue;

      const saved = await this.create(ctx, {
        resourceType,
        resourceId: resource.id,
        patientId: this.extractPatientId(resource),
        content: resource,
      });
      results.push(saved);
    }

    return {
      resourceType: 'Bundle',
      type: bundle.type ?? 'collection',
      entryCount: results.length,
      entries: results,
    };
  }

  private mapResourceType(type: string): FhirResourceType | null {
    const allowed = Object.values(FhirResourceType) as string[];
    return allowed.includes(type) ? (type as FhirResourceType) : null;
  }

  private extractPatientId(resource: Record<string, unknown>): string | undefined {
    const subject = resource.subject as { reference?: string } | undefined;
    const ref = subject?.reference;
    if (!ref?.startsWith('Patient/')) return undefined;
    return ref.replace('Patient/', '');
  }
}
