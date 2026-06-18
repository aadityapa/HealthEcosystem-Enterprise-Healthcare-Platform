import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PipelineStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { KafkaIngestService } from '@/services/kafka-ingest.service';
import { S3LakeService } from '@/services/s3-lake.service';
import {
  CreatePipelineDto,
  ListPipelinesQueryDto,
  UpdatePipelineDto,
} from './dto/pipelines.dto';

@Injectable()
export class PipelinesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly kafkaIngest: KafkaIngestService,
    private readonly s3Lake: S3LakeService,
  ) {}

  async list(ctx: ServiceRequestContext, query: ListPipelinesQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.dataPipeline.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataPipeline.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const pipeline = await this.prisma.dataPipeline.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async create(ctx: ServiceRequestContext, dto: CreatePipelineDto) {
    return this.prisma.dataPipeline.create({
      data: {
        tenantId: ctx.tenantId,
        pipelineName: dto.pipelineName,
        sourceTopic: dto.sourceTopic,
        lakePath: dto.lakePath,
        warehouseTable: dto.warehouseTable,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdatePipelineDto) {
    await this.getById(ctx, id);
    return this.prisma.dataPipeline.update({
      where: { id },
      data: {
        ...(dto.pipelineName !== undefined && { pipelineName: dto.pipelineName }),
        ...(dto.sourceTopic !== undefined && { sourceTopic: dto.sourceTopic }),
        ...(dto.lakePath !== undefined && { lakePath: dto.lakePath }),
        ...(dto.warehouseTable !== undefined && { warehouseTable: dto.warehouseTable }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.dataPipeline.delete({ where: { id } });
    return { deleted: true };
  }

  async run(ctx: ServiceRequestContext, id: string) {
    const pipeline = await this.getById(ctx, id);
    const runNumber = await this.nextRunNumber(pipeline.id);

    const run = await this.prisma.pipelineRun.create({
      data: {
        pipelineId: pipeline.id,
        runNumber,
        status: PipelineStatus.RUNNING,
      },
    });

    const kafkaResult = await this.kafkaIngest.consumeTopic(pipeline.sourceTopic);
    const s3Result = await this.s3Lake.writeObject(
      `${pipeline.lakePath}/${runNumber}.parquet`,
      kafkaResult.messagesConsumed * 128,
    );

    const recordsOut = BigInt(kafkaResult.messagesConsumed);

    const [updatedRun, updatedPipeline] = await Promise.all([
      this.prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: PipelineStatus.COMPLETED,
          completedAt: new Date(),
          recordsIn: recordsOut,
          recordsOut,
        },
      }),
      this.prisma.dataPipeline.update({
        where: { id: pipeline.id },
        data: {
          status: PipelineStatus.COMPLETED,
          lastRunAt: new Date(),
          recordsProcessed: recordsOut,
        },
      }),
    ]);

    return {
      run: updatedRun,
      pipeline: updatedPipeline,
      ingest: kafkaResult,
      lake: s3Result,
    };
  }

  private async nextRunNumber(pipelineId: string): Promise<string> {
    const count = await this.prisma.pipelineRun.count({ where: { pipelineId } });
    return `RUN-${String(count + 1).padStart(6, '0')}`;
  }
}
