import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  // TOS §1.4/§2.1: account creation implies agreement to the Platform
  // Terms; the signup form records the user's acceptance. Optional so
  // existing callers (incl. API test suites) that omit it keep working.
  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;
}
