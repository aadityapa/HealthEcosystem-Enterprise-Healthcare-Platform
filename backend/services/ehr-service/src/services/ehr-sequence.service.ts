import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class EhrSequenceService {
  next(prefix: string): string {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${suffix}`;
  }
}
