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
  deadline: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  niches: string[];

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
