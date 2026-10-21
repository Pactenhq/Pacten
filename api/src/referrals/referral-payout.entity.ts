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

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  decidedAt: Date;

  @CreateDateColumn()
  requestedAt: Date;
}
