import { Module } from '@nestjs/common';
import { ResolveController } from './resolve.controller';
import { ResolveService } from './resolve.service';

@Module({
  controllers: [ResolveController],
  providers: [ResolveService],
})
export class ResolveModule {}
