import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateMobileConfigDto {
  @ApiProperty({ description: 'Custom mobile app configuration JSON' })
  @IsObject()
  mobileAppConfig!: Record<string, unknown>;
}
