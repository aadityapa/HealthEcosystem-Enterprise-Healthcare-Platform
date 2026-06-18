import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateThemeDto {
  @ApiProperty({ description: 'Theme configuration JSON' })
  @IsObject()
  themeConfig!: Record<string, unknown>;
}
