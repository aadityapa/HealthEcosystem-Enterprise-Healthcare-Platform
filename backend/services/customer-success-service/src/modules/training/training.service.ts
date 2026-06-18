import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { EnrollTrainingDto, UpdateTrainingProgressDto } from './dto/training.dto';

@Injectable()
export class TrainingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listCourses() {
    return this.prisma.trainingCourse.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    });
  }

  async enroll(ctx: ServiceRequestContext, dto: EnrollTrainingDto) {
    const course = await this.prisma.trainingCourse.findUnique({
      where: { id: dto.courseId },
    });
    if (!course || !course.isActive) {
      throw new NotFoundException('Training course not found');
    }

    const userId = dto.userId ?? ctx.userId;
    const existing = await this.prisma.trainingEnrollment.findUnique({
      where: {
        tenantId_userId_courseId: {
          tenantId: ctx.tenantId,
          userId,
          courseId: dto.courseId,
        },
      },
    });
    if (existing) throw new ConflictException('User already enrolled in course');

    return this.prisma.trainingEnrollment.create({
      data: {
        tenantId: ctx.tenantId,
        userId,
        courseId: dto.courseId,
      },
      include: { course: true },
    });
  }

  async updateProgress(
    ctx: ServiceRequestContext,
    enrollmentId: string,
    dto: UpdateTrainingProgressDto,
  ) {
    const enrollment = await this.prisma.trainingEnrollment.findFirst({
      where: { id: enrollmentId, tenantId: ctx.tenantId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const completedAt = dto.progressPct >= 100 ? new Date() : null;
    const status = dto.progressPct >= 100 ? 'completed' : 'in_progress';

    return this.prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPct: dto.progressPct,
        status,
        completedAt,
      },
      include: { course: true },
    });
  }
}
