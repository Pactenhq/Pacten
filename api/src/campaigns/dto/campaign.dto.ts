import { IsString, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CampaignStatus } from '../campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(3, {
    message: 'Campaign title must be at least 3 characters long.',
  })
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  niches?: string[];
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(3, {
    message: 'Campaign title must be at least 3 characters long.',
  })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  niches?: string[];

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  proposal?: string;

  @IsOptional()
  @IsString()
  proposedBudget?: string;
}
