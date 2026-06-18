import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StatesController, CitiesController } from './geography.controller';
import { GeographyService } from './geography.service';
import { GeographyHandlers } from './handlers/geography.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [StatesController, CitiesController],
  providers: [GeographyService, ...GeographyHandlers],
})
export class GeographyModule {}
