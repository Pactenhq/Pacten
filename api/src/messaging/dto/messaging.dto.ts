import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty()
  otherUserId: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
