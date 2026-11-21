import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export type ContractTemplate = 'simple' | 'standard';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dealId: string;

  @Column()
  brandId: string;

  @Column()
  creatorId: string;

  @Column()
  title: string;

  // Snapshot of the agreed deal terms at generation time.
  @Column('text')
  termsSnapshot: string;

  // Legal wording for simple contracts: the client-supplied Simple
  @Column('text')
  legalWording: string;

  /**
   * Which agreement form this contract uses. 'simple' is the
   * client-supplied Simple Transaction Agreement (default);
   * 'standard' is the Pacten Standard Transaction Agreement
   * (client-supplied template, versioned snapshot below).
   */
  @Column({ type: 'varchar', length: 20, default: 'simple' })
  template: ContractTemplate;

  /** Template version used at generation time (e.g. 'standard-v1'). */
  @Column({ type: 'varchar', length: 40, nullable: true })
  templateVersion: string | null;

  /**
   * Frozen verbatim template text captured at generation time.
   * Rendering a standard contract uses ONLY this snapshot + the frozen
   * fieldValues + the signature columns — never live deal/user records —
   * so signed/accepted contracts never change when the template changes.
   */
  @Column('text', { nullable: true })
  templateSnapshot: string | null;

  /**
   * Complete frozen field map for the standard template (auto-filled,
   * prefilled and form-entered values, keyed by placeholder key), built
   * after the first save so AGREEMENT ID / AGREEMENT DATE are known.
   * Signature-block values are NOT stored here: they are computed at
   * render time from the signature columns below.
   */
  @Column({ type: 'jsonb', nullable: true })
  fieldValues: Record<string, string> | null;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.SENT,
  })
  status: ContractStatus;

  @Column()
  generatedById: string;

  @Column({ nullable: true })
  acceptedById: string;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  brandSignedAt: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  brandSignatoryName: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  brandSignatoryTitle: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  creatorSignedAt: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  creatorSignatoryName: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  creatorSignatoryTitle: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Transient (never persisted): the rendered agreement text, produced
   * by enrich() from the frozen snapshot/wording + fieldValues +
   * signature columns. Null for legacy rows whose text carries no
   * placeholders, which render from termsSnapshot + legalWording.
   */
  renderedAgreement?: string | null;
}
