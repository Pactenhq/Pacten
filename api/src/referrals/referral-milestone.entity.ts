import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('referral_milestones')
export class ReferralMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Number of successful referrals required to unlock this milestone.
  @Column({ unique: true })
  referralsRequired: number;

  // Reward in cents. 0 = non-cash reward (see rewardLabel, e.g. "VIP Status").
  @Column({ default: 0 })
  rewardCents: number;

  @Column()
  rewardLabel: string;

  @Column({ default: true })
  active: boolean;
}
