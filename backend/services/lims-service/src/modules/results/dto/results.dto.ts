import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from '@health/validation';
import { Type } from '@health/validation';

export class ResultEntryDto {
  @IsUUID()
  parameterId!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  rawValue?: string;

  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class EnterResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultEntryDto)
  results!: ResultEntryDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyResultDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveResultDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListPendingResultsQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
