import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateUpfrontPaymentDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  amountCents?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
