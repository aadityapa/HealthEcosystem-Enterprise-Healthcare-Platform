import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger } from '@health/logger';

export interface S3LakeWriteResult {
  bucket: string;
  objectKey: string;
  sizeBytes: number;
  status: 'stub' | 'written';
}

@Injectable()
export class S3LakeService {
  private readonly logger = createLogger({ service: 'data-s3-lake' });

  constructor(private readonly config: ConfigService) {}

  getBucket(): string {
    return this.config.get<string>('AWS_S3_BUCKET') ?? 'healthecosystem-data-lake';
  }

  async writeObject(
    objectKey: string,
    payloadSizeBytes = 4096,
  ): Promise<S3LakeWriteResult> {
    const bucket = this.getBucket();
    this.logger.info({ bucket, objectKey }, 'S3 lake write stub');

    return {
      bucket,
      objectKey,
      sizeBytes: payloadSizeBytes,
      status: 'stub',
    };
  }
}
