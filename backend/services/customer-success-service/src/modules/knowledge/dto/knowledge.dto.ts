import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateKnowledgeArticleDto {
  @IsString()
  @MaxLength(128)
  slug!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(64)
  category!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateKnowledgeArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
