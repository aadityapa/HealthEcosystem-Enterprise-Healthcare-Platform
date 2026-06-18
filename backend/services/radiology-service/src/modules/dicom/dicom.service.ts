import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModalityType, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { DicomParserService } from '@/services/dicom-parser.service';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { DicomStoreDto, ListInstancesQueryDto } from './dto/dicom.dto';

@Injectable()
export class DicomService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly dicomParser: DicomParserService,
  ) {}

  async store(ctx: ServiceRequestContext, dto: DicomStoreDto) {
    const buffer = Buffer.from(dto.data, 'base64');
    const tags = this.dicomParser.parseBuffer(buffer);

    if (!tags.studyInstanceUid || !tags.seriesInstanceUid || !tags.sopInstanceUid) {
      throw new BadRequestException('DICOM buffer missing required UIDs');
    }

    let study = dto.studyId
      ? await this.prisma.radiologyStudy.findFirst({
          where: { id: dto.studyId, tenantId: ctx.tenantId },
        })
      : await this.prisma.radiologyStudy.findFirst({
          where: { tenantId: ctx.tenantId, studyUid: tags.studyInstanceUid },
        });

    if (!study) {
      throw new NotFoundException(
        'Radiology study not found for DICOM store; create study first or provide studyId',
      );
    }

    const modality = tags.modality ?? study.modality;

    let series = await this.prisma.dicomSeries.findFirst({
      where: { studyId: study.id, seriesUid: tags.seriesInstanceUid },
    });

    if (!series) {
      series = await this.prisma.dicomSeries.create({
        data: {
          studyId: study.id,
          seriesUid: tags.seriesInstanceUid,
          modality,
        },
      });
    }

    const existing = await this.prisma.dicomInstance.findFirst({
      where: { seriesId: series.id, sopInstanceUid: tags.sopInstanceUid },
    });
    if (existing) {
      return { instance: existing, parsed: tags, duplicate: true };
    }

    const instance = await this.prisma.dicomInstance.create({
      data: {
        seriesId: series.id,
        sopInstanceUid: tags.sopInstanceUid,
        storagePath: dto.storagePath,
        fileSize: BigInt(buffer.length),
      },
    });

    await this.prisma.dicomSeries.update({
      where: { id: series.id },
      data: { instanceCount: { increment: 1 } },
    });

    return { instance, parsed: tags, duplicate: false };
  }

  async listInstances(ctx: ServiceRequestContext, filters: ListInstancesQueryDto) {
    if (!filters.seriesId && !filters.studyId) {
      throw new BadRequestException('seriesId or studyId is required');
    }

    if (filters.seriesId) {
      const series = await this.prisma.dicomSeries.findFirst({
        where: {
          id: filters.seriesId,
          study: { tenantId: ctx.tenantId },
        },
      });
      if (!series) throw new NotFoundException('DICOM series not found');

      return this.prisma.dicomInstance.findMany({
        where: { seriesId: filters.seriesId },
        orderBy: { instanceNumber: 'asc' },
      });
    }

    const study = await this.prisma.radiologyStudy.findFirst({
      where: { id: filters.studyId, tenantId: ctx.tenantId },
    });
    if (!study) throw new NotFoundException('Radiology study not found');

    return this.prisma.dicomInstance.findMany({
      where: { series: { studyId: study.id } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
