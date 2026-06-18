import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClaimStatus } from '@health/db';

export class CreateInsuranceTPADto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiEndpoint?: string;
}

export class ClaimLineDto {
  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateInsuranceClaimDto {
  @ApiProperty()
  @IsUUID()
  invoiceId!: string;

  @ApiProperty()
  @IsUUID()
  tpaId!: string;

  @ApiProperty()
  @IsString()
  claimNumber!: string;

  @ApiProperty()
  @IsString()
  policyNumber!: string;

  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @ApiProperty({ type: [ClaimLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClaimLineDto)
  lines!: ClaimLineDto[];
}

export class UpdateClaimStatusDto {
  @ApiProperty({ enum: ClaimStatus })
  @IsString()
  status!: ClaimStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  settledAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ReconcileClaimDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  settledAmount!: number;
}
