import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class ConvertCurrencyQueryDto {
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'INR' })
  @IsString()
  @MaxLength(3)
  from!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @MaxLength(3)
  to!: string;
}
