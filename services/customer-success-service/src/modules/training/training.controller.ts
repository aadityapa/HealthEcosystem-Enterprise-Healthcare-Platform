import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TrainingService } from './training.service';
import { EnrollTrainingDto, UpdateTrainingProgressDto } from './dto/training.dto';

@ApiTags('Customer Success Training')
@Controller('api/v1/customer-success/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('courses')
  @ApiOperation({ summary: 'List training courses' })
  listCourses() {
    return this.trainingService.listCourses();
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll user in training course' })
  enroll(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: EnrollTrainingDto) {
    return this.trainingService.enroll(ctx, dto);
  }

  @Patch('progress/:enrollmentId')
  @ApiOperation({ summary: 'Update training progress' })
  updateProgress(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @Body() dto: UpdateTrainingProgressDto,
  ) {
    return this.trainingService.updateProgress(ctx, enrollmentId, dto);
  }
}
