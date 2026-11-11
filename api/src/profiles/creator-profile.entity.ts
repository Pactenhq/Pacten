import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('creator_profiles')
export class CreatorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (u) => u.creatorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  displayName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('text', { array: true, default: '{}' })
  niches: string[];

  @Column('text', { array: true, default: '{}' })
  languages: string[];

  @Column('text', { array: true, default: '{}' })
  industries: string[];

  // Skills (Nov 2026, showcase follow-up): text array like
  // languages/industries — feeds the creators Skills filter. Added
  // because the filter was ordered while creators had no skills field
  // at all; a filter with no data source would have been decorative.
  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column('text', { array: true, default: '{}' })
  platforms: string[];

  @Column({ nullable: true })
  followers: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  availableNow: boolean;

  @Column({ nullable: true })
  rate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
