import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { BrandProfile } from '../profiles/brand-profile.entity';
import { CreatorProfile } from '../profiles/creator-profile.entity';
import { ProfessionalProfile } from '../profiles/professional-profile.entity';

export enum UserRole {
  BRAND = 'brand',
  CREATOR = 'creator',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true, select: false })
  verificationToken: string;

  @Column({ nullable: true })
  verificationExpiresAt: Date;

  @Column({ nullable: true, select: false })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpiresAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => BrandProfile, (p) => p.user, { nullable: true })
  brandProfile: BrandProfile;

  @OneToOne(() => CreatorProfile, (p) => p.user, { nullable: true })
  creatorProfile: CreatorProfile;

  @OneToOne(() => ProfessionalProfile, (p) => p.user, { nullable: true })
  professionalProfile: ProfessionalProfile;
}
