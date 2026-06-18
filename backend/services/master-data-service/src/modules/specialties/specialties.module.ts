import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesHandlers } from './handlers/specialties.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, ...SpecialtiesHandlers],
})
export class SpecialtiesModule {}
