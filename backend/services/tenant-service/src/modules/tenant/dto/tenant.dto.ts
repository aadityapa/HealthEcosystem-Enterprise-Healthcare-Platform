import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BranchType, TenantStatus, TenantTier } from '@health/db';
import { PaginationDto } from '@health/validation';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with optional hyphens',
  })
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsEnum(TenantTier)
  tier?: TenantTier;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  dataRegion?: string;
}

export class CreateOrganizationDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  orgType?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  pincode!: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateBranchDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  parentBranchId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEnum(BranchType)
  branchType!: BranchType;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @IsOptional()
  @IsBoolean()
  isCollectionCenter?: boolean;

  @IsOptional()
  @IsBoolean()
  isProcessingLab?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

export class CreateDepartmentDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  organizationId!: string;

  @IsUUID()
  branchId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;
}

export class CreateFranchiseAgreementDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  organizationId!: string;

  @IsUUID()
  franchiseBranchId!: string;

  @IsUUID()
  parentBranchId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  agreementNumber!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  revenueSharePct?: number;

  @IsOptional()
  @IsBoolean()
  canSetPricing?: boolean;

  @IsOptional()
  @IsBoolean()
  canProcessLocal?: boolean;

  @IsOptional()
  @IsBoolean()
  canReleaseReports?: boolean;

  @IsOptional()
  @IsObject()
  brandingConfig?: Record<string, unknown>;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}

export class ListBranchesQueryDto extends PaginationDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsEnum(BranchType)
  branchType?: BranchType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  parentBranchId?: string;
}

export class GetBranchTreeQueryDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  rootBranchId?: string;
}

export interface BranchTreeNode {
  id: string;
  tenantId: string;
  organizationId: string;
  parentBranchId: string | null;
  code: string;
  name: string;
  branchType: BranchType;
  isActive: boolean;
  children: BranchTreeNode[];
}

export interface TenantDetailResponse {
  id: string;
  slug: string;
  name: string;
  tier: TenantTier;
  status: TenantStatus;
  settings: unknown;
  dataRegion: string;
  createdAt: Date;
  updatedAt: Date;
  organizations?: Array<{
    id: string;
    legalName: string;
    tradeName: string | null;
  }>;
}
