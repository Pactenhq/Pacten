import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Application } from '../campaigns/application.entity';

export enum DealStatus {
  PROPOSED = 'proposed',
  NEGOTIATING = 'negotiating',
  AGREED = 'agreed',
  ACTIVE = 'active',
  // M4: work completion → brand approval → payout release
  SUBMITTED = 'submitted', // creator submitted the work
  APPROVED = 'approved', // brand approved the work
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: User;

  @Column()
  brandId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToOne(() => Application, { nullable: true, eager: true })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column({ nullable: true })
  applicationId: string;

  @Column({ nullable: true })
  campaignId: string;

  // PRD exit criteria: a valid (accepted) opportunity can progress to a
  // deal. The opportunity's dealId is set back when this is present.
  @Column({ nullable: true })
  opportunityId: string;

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.PROPOSED,
  })
  status: DealStatus;

  @Column('text', { nullable: true })
  terms: string;

  @Column({ nullable: true })
  agreedBudget: string;

  @Column({ nullable: true })
  deadline: string;

  @Column('text', { nullable: true })
  deliverables: string;

  @Column({ nullable: true })
  proposedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
