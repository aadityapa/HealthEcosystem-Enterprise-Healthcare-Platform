import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesHandlers } from './handlers/profiles.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, ...ProfilesHandlers],
})
export class ProfilesModule {}
