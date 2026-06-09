import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AbnormalDetectDto {
  @ApiProperty({ example: 'GLUCOSE' })
  @IsString()
  testCode!: string;

  @ApiProperty({ example: 180 })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  historicalValues?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mean?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stdDev?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referenceLow?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referenceHigh?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}

export class CriticalValueDto {
  @ApiProperty({ example: 'GLUCOSE' })
  @IsString()
  testCode!: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  criticalLow?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  criticalHigh?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  panicLow?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  panicHigh?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}

export class InterpretDto {
  @ApiProperty({ example: 'HEMOGLOBIN' })
  @IsString()
  testCode!: string;

  @ApiProperty({ example: 11.5 })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ example: 'g/dL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referenceLow?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  referenceHigh?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}

export class RiskFactorDto {
  @ApiProperty({ example: 'DIABETES' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 0.8 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class RiskPredictDto {
  @ApiPropertyOptional({ example: 58 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  patientAge?: number;

  @ApiProperty({ type: [RiskFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskFactorDto)
  factors!: RiskFactorDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputRef?: string;
}
