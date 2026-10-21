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

  // Legal wording. PLACEHOLDER until the client provides final legal text.
  // Swappable via the CONTRACT_LEGAL_WORDING env var — no code change needed.
  @Column('text')
  legalWording: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
