import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Application } from './application.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  COMPLETED = 'completed',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  deliverables: string;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  deadline: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  niches: string[];

  // M5 fix (Nov 20): campaign REQUIREMENTS the brand sets at creation
  // (all optional). The Country / Language / Skills / Industry filters
  // on /campaigns derive their options from these fields — before this,
  // campaigns carried none of that data, so the four dropdowns rendered
  // with no options at all. Legacy campaigns keep null here and appear
  // only under "All" for each filter (no backfill).
  // Industry is a NEW field (not niches): the campaign create form
  // never sets niches, so wiring the Industry filter to niches would
  // have produced an always-empty dropdown.
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  industry: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: User;

  @Column()
  brandId: string;

  @OneToMany(() => Application, (app) => app.campaign)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
