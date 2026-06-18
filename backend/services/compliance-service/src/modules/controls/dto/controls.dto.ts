import { ControlStatus } from '@health/db';
import { IsEnum } from 'class-validator';

export class UpdateControlDto {
  @IsEnum(ControlStatus)
  status!: ControlStatus;
}
