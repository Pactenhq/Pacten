import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  IsIn,
} from 'class-validator';

export class CreateOpportunityDto {
  @IsUUID()
  recipientId: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  budget?: string;
}

export class RespondOpportunityDto {
  @IsIn(['accept', 'decline'])
  action: 'accept' | 'decline';
}
