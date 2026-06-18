import { IsUUID, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { Type } from 'class-transformer';

export class CheckInDto {
  @ApiProperty()
  @IsUUID()
  phlebotomistId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

export class CheckOutDto {
  @ApiProperty()
  @IsUUID()
  phlebotomistId!: string;
}

export class ListAttendanceDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  phlebotomistId?: string;
}
