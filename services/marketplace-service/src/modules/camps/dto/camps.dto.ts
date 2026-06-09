import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCampBookingDto {
  @IsUUID()
  campId!: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  bookingNumber?: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;
}

export class ListCampBookingsQueryDto {
  @IsOptional()
  @IsUUID()
  campId?: string;
}
