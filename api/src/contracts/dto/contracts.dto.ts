import { IsString, IsOptional } from 'class-validator';

export class GenerateContractDto {
  @IsString()
  @IsOptional()
  title?: string;
}
