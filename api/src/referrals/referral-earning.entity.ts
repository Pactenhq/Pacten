import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum EarningType {
  // Legacy types from the demo milestone system. They no longer generate
  // cash (client final rules, Oct 2026) but remain for historical rows.
  SIGNUP = 'signup',
  MILESTONE = 'milestone',
  // Client final rules: 20% of a referred user's first 3 subscription
  // payments; 10% of Pacten's commission on their first completed paid deal.
  SUBSCRIPTION = 'subscription',
  DEAL = 'deal',
}

export enum EarningStatus {
  PENDING = 'pending', // earned but not yet payable
  AVAILABLE = 'available', // can be paid out
  HELD = 'held', // locked inside a requested payout, or held by admin (fraud review)
  PAID = 'paid', // paid out (manual, by admin)
  REVERSED = 'reversed', // refunded / chargeback / fraudulent — excluded from all totals
}

@Entity('referral_earnings')
export class ReferralEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  referralId: string;

  @Column({ nullable: true })
  milestoneId: string;

  // Source of the earning: checkout session id (subscription type) or
  // deal id (deal type). Used for idempotency and refund reversals.
  @Column({ nullable: true })
  sourceId: string;

  @Column({ default: 0 })
  amountCents: number;

  @Column({ type: 'enum', enum: EarningType })
  type: EarningType;

  @Column({
    type: 'enum',
    enum: EarningStatus,
    default: EarningStatus.PENDING,
  })
  status: EarningStatus;

  // Set while this earning is held inside a payout request.
  @Column({ nullable: true })
  payoutId: string;

  @CreateDateColumn()
  createdAt: Date;
}
