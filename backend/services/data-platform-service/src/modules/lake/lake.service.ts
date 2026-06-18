import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { KafkaIngestService } from '@/services/kafka-ingest.service';
import { S3LakeService } from '@/services/s3-lake.service';
import { IngestLakeDto, ListLakeObjectsQueryDto } from './dto/lake.dto';

@Injectable()
export class LakeService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly kafkaIngest: KafkaIngestService,
    private readonly s3Lake: S3LakeService,
  ) {}

  async listObjects(ctx: ServiceRequestContext, query: ListLakeObjectsQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(query.sourceEvent && { sourceEvent: query.sourceEvent }),
    };

    const [items, total] = await Promise.all([
      this.prisma.dataLakeObject.findMany({
        where,
        skip,
        take,
        orderBy: { ingestedAt: 'desc' },
      }),
      this.prisma.dataLakeObject.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async ingest(ctx: ServiceRequestContext, dto: IngestLakeDto) {
    const kafkaResult = await this.kafkaIngest.consumeTopic(dto.sourceTopic);
    const partitionDate = new Date();
    const objectKey = `lake/${ctx.tenantId}/${dto.sourceEvent}/${partitionDate.toISOString().slice(0, 10)}.parquet`;
    const s3Result = await this.s3Lake.writeObject(
      objectKey,
      kafkaResult.messagesConsumed * 256,
    );

    const object = await this.prisma.dataLakeObject.create({
      data: {
        tenantId: ctx.tenantId,
        bucket: s3Result.bucket,
        objectKey: s3Result.objectKey,
        sourceEvent: dto.sourceEvent,
        format: dto.format ?? 'parquet',
        sizeBytes: BigInt(s3Result.sizeBytes),
        partitionDate,
      },
    });

    return { object, ingest: kafkaResult, lake: s3Result };
  }
}
