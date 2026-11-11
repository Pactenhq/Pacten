import {
  IsString,
  IsOptional,
  IsIn,
  IsObject,
  MaxLength,
} from 'class-validator';

export class GenerateContractDto {
  @IsString()
  @IsOptional()
  title?: string;

  /**
   * 'simple' (existing wording) or 'standard' (Pacten Standard
   * Transaction Agreement). Defaults to 'simple' when omitted, so
   * existing callers keep working unchanged.
   */
  @IsIn(['simple', 'standard'])
  @IsOptional()
  template?: 'simple' | 'standard';

  /**
   * Guided-form values for the standard template, keyed by placeholder
   * key (e.g. PARTY_A_LEGAL_NAME). Unknown keys are ignored; required
   * fields are validated in the service.
   */
  @IsObject()
  @IsOptional()
  fieldValues?: Record<string, string>;
}

export class AcceptContractDto {
  /**
   * Name recorded with the confirmation. Falls back to the caller's
   * display name when omitted.
   */
  @IsString()
  @MaxLength(200)
  @IsOptional()
  signatoryName?: string;

  /** Optional position/title recorded with the confirmation. */
  @IsString()
  @MaxLength(200)
  @IsOptional()
  signatoryTitle?: string;
}
