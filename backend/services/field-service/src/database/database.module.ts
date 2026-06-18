import { Global, Module } from '@nestjs/common';
import { prisma } from '@health/db';

export const PRISMA = 'PRISMA';

@Global()
@Module({
  providers: [{ provide: PRISMA, useValue: prisma }],
  exports: [PRISMA],
})
export class DatabaseModule {}
