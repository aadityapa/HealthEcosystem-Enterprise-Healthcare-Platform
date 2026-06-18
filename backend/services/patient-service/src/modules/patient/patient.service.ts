import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { PrismaClient, Prisma } from '@health/db';
import { ConsentStatus } from '@health/db';
import { setTenantContext } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type {
  RegisterPatientPayload,
  UpdatePatientPayload,
  RecordConsentPayload,
  AddTimelineEventPayload,
  CreateVisitPayload,
  LinkFamilyMemberPayload,
  CreateDocumentPayload,
} from './commands/patient.commands';

const PATIENT_360_INCLUDE = {
  identifiers: true,
  consents: { orderBy: { createdAt: 'desc' as const } },
  documents: { orderBy: { createdAt: 'desc' as const } },
  visits: { orderBy: { checkInAt: 'desc' as const }, take: 10 },
  timelineEvents: { orderBy: { occurredAt: 'desc' as const }, take: 20 },
  familyMembers: {
    include: {
      family: true,
    },
  },
} satisfies Prisma.PatientInclude;

@Injectable()
export class PatientService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async withTenantContext<T>(
    tenantId: string,
    organizationId: string,
    branchId: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    await setTenantContext(tenantId, organizationId, branchId);
    return fn();
  }

  formatYymm(date: Date): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yy}${mm}`;
  }

  formatVisitDate(date: Date): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  buildUhid(branchCode: string, yymm: string, sequence: number): string {
    const seq = String(sequence).padStart(6, '0');
    return `${branchCode}${yymm}${seq}`;
  }

  async generateUhid(
    tx: Prisma.TransactionClient,
    tenantId: string,
    branchId: string,
    referenceDate = new Date(),
  ): Promise<string> {
    const branch = await tx.branch.findFirst({
      where: { id: branchId, tenantId },
      select: { code: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const yymm = this.formatYymm(referenceDate);
    const prefix = `${branch.code}${yymm}`;

    const existing = await tx.uhidSequence.findUnique({
      where: { tenantId_branchId: { tenantId, branchId } },
    });

    let nextSeq: number;

    if (!existing || existing.prefix !== prefix) {
      const created = await tx.uhidSequence.upsert({
        where: { tenantId_branchId: { tenantId, branchId } },
        create: { tenantId, branchId, prefix, lastSeq: 1 },
        update: { prefix, lastSeq: 1 },
      });
      nextSeq = created.lastSeq;
    } else {
      const updated = await tx.uhidSequence.update({
        where: { tenantId_branchId: { tenantId, branchId } },
        data: { lastSeq: { increment: 1 } },
      });
      nextSeq = updated.lastSeq;
    }

    return this.buildUhid(branch.code, yymm, nextSeq);
  }

  async generateVisitNumber(
    tx: Prisma.TransactionClient,
    tenantId: string,
    branchId: string,
    referenceDate = new Date(),
  ): Promise<string> {
    const branch = await tx.branch.findFirst({
      where: { id: branchId, tenantId },
      select: { code: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const datePart = this.formatVisitDate(referenceDate);
    const prefix = `${branch.code}V${datePart}`;

    const count = await tx.patientVisit.count({
      where: {
        tenantId,
        branchId,
        visitNumber: { startsWith: prefix },
      },
    });

    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  private async assertPatientExists(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  }

  async registerPatient(payload: RegisterPatientPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      userId,
      dateOfBirth,
      address,
      metadata,
      ...rest
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      const duplicate = await this.prisma.patient.findFirst({
        where: { tenantId, phone: rest.phone },
      });

      if (duplicate) {
        throw new ConflictException(
          'A patient with this phone number already exists',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const uhid = await this.generateUhid(tx, tenantId, branchId);
        const now = new Date();

        const patient = await tx.patient.create({
          data: {
            tenantId,
            organizationId,
            branchId,
            uhid,
            registeredBranchId: branchId,
            createdBy: userId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address: (address ?? {}) as unknown as Prisma.InputJsonValue,
            metadata: (metadata ?? {}) as Prisma.InputJsonValue,
            ...rest,
          },
        });

        await tx.patientTimelineEvent.create({
          data: {
            tenantId,
            organizationId,
            branchId,
            patientId: patient.id,
            eventType: 'patient.registered',
            title: 'Patient registered',
            description: `UHID ${uhid} assigned`,
            occurredAt: now,
          },
        });

        return patient;
      });
    });
  }

  async updatePatient(payload: UpdatePatientPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      dateOfBirth,
      address,
      metadata,
      ...rest
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);

      if (rest.phone) {
        const duplicate = await this.prisma.patient.findFirst({
          where: {
            tenantId,
            phone: rest.phone,
            NOT: { id: patientId },
          },
        });
        if (duplicate) {
          throw new ConflictException(
            'Another patient with this phone number already exists',
          );
        }
      }

      const data: Prisma.PatientUpdateInput = {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address: address
          ? (address as unknown as Prisma.InputJsonValue)
          : undefined,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      };

      const patient = await this.prisma.patient.update({
        where: { id: patientId },
        data,
      });

      await this.prisma.patientTimelineEvent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          eventType: 'patient.updated',
          title: 'Patient record updated',
          occurredAt: new Date(),
        },
      });

      return patient;
    });
  }

  async recordConsent(payload: RecordConsentPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      consentType,
      grantedAt,
      expiresAt,
      abdmArtefact,
      ipAddress,
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);

      const status = grantedAt ? ConsentStatus.GRANTED : ConsentStatus.PENDING;

      const consent = await this.prisma.patientConsent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          consentType,
          status,
          grantedAt: grantedAt ? new Date(grantedAt) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          abdmArtefact: abdmArtefact as Prisma.InputJsonValue | undefined,
          ipAddress,
        },
      });

      await this.prisma.patientTimelineEvent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          eventType: 'consent.recorded',
          title: `Consent recorded: ${consentType}`,
          referenceType: 'patient_consent',
          referenceId: consent.id,
          occurredAt: new Date(),
        },
      });

      return consent;
    });
  }

  async addTimelineEvent(payload: AddTimelineEventPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      eventType,
      title,
      description,
      referenceType,
      referenceId,
      occurredAt,
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);

      return this.prisma.patientTimelineEvent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          eventType,
          title,
          description,
          referenceType,
          referenceId,
          occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        },
      });
    });
  }

  async createVisit(payload: CreateVisitPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      visitType,
      checkInAt,
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);

      return this.prisma.$transaction(async (tx) => {
        const visitNumber = await this.generateVisitNumber(
          tx,
          tenantId,
          branchId,
        );

        const visit = await tx.patientVisit.create({
          data: {
            tenantId,
            organizationId,
            branchId,
            patientId,
            visitType,
            visitNumber,
            checkInAt: checkInAt ? new Date(checkInAt) : new Date(),
          },
        });

        await tx.patientTimelineEvent.create({
          data: {
            tenantId,
            organizationId,
            branchId,
            patientId,
            eventType: 'visit.created',
            title: `Visit ${visitNumber}`,
            description: visitType,
            referenceType: 'patient_visit',
            referenceId: visit.id,
            occurredAt: visit.checkInAt,
          },
        });

        return visit;
      });
    });
  }

  async getPatient(tenantId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: PATIENT_360_INCLUDE,
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async searchPatients(
    tenantId: string,
    query: string | undefined,
    page: number,
    limit: number,
  ) {
    const { skip, take } = paginate(page, limit);
    const trimmed = query?.trim();

    const where: Prisma.PatientWhereInput = { tenantId };

    if (trimmed) {
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      where.OR = [
        { uhid: { contains: trimmed, mode: 'insensitive' } },
        { phone: { contains: trimmed } },
        {
          AND: tokens.map((token) => ({
            OR: [
              { firstName: { contains: token, mode: 'insensitive' } },
              { middleName: { contains: token, mode: 'insensitive' } },
              { lastName: { contains: token, mode: 'insensitive' } },
            ],
          })),
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uhid: true,
          firstName: true,
          middleName: true,
          lastName: true,
          phone: true,
          email: true,
          gender: true,
          dateOfBirth: true,
          status: true,
          branchId: true,
          createdAt: true,
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: paginationMeta(total, page, take),
    };
  }

  async getPatientTimeline(
    tenantId: string,
    patientId: string,
    page: number,
    limit: number,
  ) {
    await this.assertPatientExists(tenantId, patientId);
    const { skip, take } = paginate(page, limit);

    const where = { tenantId, patientId };

    const [data, total] = await Promise.all([
      this.prisma.patientTimelineEvent.findMany({
        where,
        skip,
        take,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.patientTimelineEvent.count({ where }),
    ]);

    return {
      data,
      meta: paginationMeta(total, page, take),
    };
  }

  async getPatientVisits(
    tenantId: string,
    patientId: string,
    page: number,
    limit: number,
  ) {
    await this.assertPatientExists(tenantId, patientId);
    const { skip, take } = paginate(page, limit);
    const where = { tenantId, patientId };

    const [data, total] = await Promise.all([
      this.prisma.patientVisit.findMany({
        where,
        skip,
        take,
        orderBy: { checkInAt: 'desc' },
      }),
      this.prisma.patientVisit.count({ where }),
    ]);

    return {
      data,
      meta: paginationMeta(total, page, take),
    };
  }

  async listDocuments(tenantId: string, patientId: string) {
    await this.assertPatientExists(tenantId, patientId);

    return this.prisma.patientDocument.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDocument(payload: CreateDocumentPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      userId,
      documentType,
      fileName,
      s3Key,
      mimeType,
    } = payload;

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);

      const document = await this.prisma.patientDocument.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          documentType,
          fileName,
          s3Key,
          mimeType,
          uploadedBy: userId,
        },
      });

      await this.prisma.patientTimelineEvent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          eventType: 'document.uploaded',
          title: `Document uploaded: ${fileName}`,
          referenceType: 'patient_document',
          referenceId: document.id,
          occurredAt: new Date(),
        },
      });

      return document;
    });
  }

  async linkFamilyMember(payload: LinkFamilyMemberPayload) {
    const {
      tenantId,
      organizationId,
      branchId,
      patientId,
      relatedPatientId,
      relationship,
      familyCode,
    } = payload;

    if (patientId === relatedPatientId) {
      throw new BadRequestException('Cannot link patient to themselves');
    }

    return this.withTenantContext(tenantId, organizationId, branchId, async () => {
      await this.assertPatientExists(tenantId, patientId);
      await this.assertPatientExists(tenantId, relatedPatientId);

      const code =
        familyCode ??
        `FAM-${patientId.slice(0, 8).toUpperCase()}`;

      const family = await this.prisma.family.upsert({
        where: { tenantId_familyCode: { tenantId, familyCode: code } },
        create: {
          tenantId,
          organizationId,
          branchId,
          familyCode: code,
          headPatientId: patientId,
        },
        update: {},
      });

      const members = await this.prisma.$transaction([
        this.prisma.familyMember.upsert({
          where: {
            familyId_patientId: { familyId: family.id, patientId },
          },
          create: { familyId: family.id, patientId, relationship: 'self' },
          update: {},
        }),
        this.prisma.familyMember.upsert({
          where: {
            familyId_patientId: {
              familyId: family.id,
              patientId: relatedPatientId,
            },
          },
          create: {
            familyId: family.id,
            patientId: relatedPatientId,
            relationship,
          },
          update: { relationship },
        }),
      ]);

      await this.prisma.patientTimelineEvent.create({
        data: {
          tenantId,
          organizationId,
          branchId,
          patientId,
          eventType: 'family.linked',
          title: 'Family member linked',
          description: relationship,
          referenceType: 'family',
          referenceId: family.id,
          occurredAt: new Date(),
        },
      });

      return { family, members };
    });
  }
}
