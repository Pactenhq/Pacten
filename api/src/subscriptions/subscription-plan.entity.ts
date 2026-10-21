import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * Subscription plans — configurable, never hard-coded.
 * role: brand | creator | professional
 * tier: 'free' | 'pro' | 'elite' | 'business' (paid = price > 0)
 * priceCentsMonthly: 0 = free plan.
 */
@Entity('subscription_plans')
@Unique(['role', 'code'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role: string;

  @Column()
  code: string; // e.g. brand-pro

  @Column()
  name: string;

  @Column()
  tier: string; // free | pro | elite | business

  @Column('int', { default: 0 })
  priceCentsMonthly: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column('jsonb', { nullable: true })
  benefits: string[];

  @Column({ nullable: true })
  stripePriceId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
