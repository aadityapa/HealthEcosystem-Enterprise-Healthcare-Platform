import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  storageKey!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  fileSize?: number;

  @IsOptional()
  @IsString()
  changeNotes?: string;
}
