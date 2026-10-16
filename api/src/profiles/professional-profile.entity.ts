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

@Entity('professional_profiles')
export class ProfessionalProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (u) => u.professionalProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column('text', { array: true, default: '{}' })
  platforms: string[];

  @Column({ nullable: true })
  hourlyRate: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ default: 0 })
  yearsExperience: number;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  availableNow: boolean;

  @Column({ default: true })
  openToProjects: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
