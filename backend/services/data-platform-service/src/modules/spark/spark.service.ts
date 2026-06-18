import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SubmitSparkJobDto } from './dto/spark.dto';

@Injectable()
export class SparkService {
  constructor(private readonly config: ConfigService) {}

  submitJob(dto: SubmitSparkJobDto) {
    const clusterUrl =
      this.config.get<string>('SPARK_CLUSTER_URL') ?? 'spark://localhost:7077';
    const jobId = `spark-${uuidv4().slice(0, 8)}`;

    return {
      jobId,
      jobName: dto.jobName,
      mainClass: dto.mainClass,
      clusterUrl,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      stub: true,
    };
  }
}
