import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ReferralPayoutStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Entity('referral_payouts')
export class ReferralPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  amountCents: number;

  @Column({
    type: 'enum',
    enum: ReferralPayoutStatus,
    default: ReferralPayoutStatus.REQUESTED,
  })
  status: ReferralPayoutStatus;

  @Column({ nullable: true })
  decidedById: string;

  // Stripe transfer id (tr_...) when the approved payout was paid via a
  // Connect transfer. Null for record-only approvals (unconnected payee
  // or demo mode) — the cash transfer then happens off-platform.
  @Column({ nullable: true })
  stripeTransferId: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  decidedAt: Date;

  @CreateDateColumn()
  requestedAt: Date;
}
