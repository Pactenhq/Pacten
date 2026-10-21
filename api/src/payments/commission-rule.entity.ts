import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * Configurable platform commission rules — NEVER hard-coded in code.
 * tier: the payee's subscription tier ('free'|'pro'|'elite'|'business').
 * rateBasisPoints: 1000 = 10%. Client final rates (Oct 2026).
 */
@Entity('commission_rules')
@Unique(['role', 'tier'])
export class CommissionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role: string; // brand | creator | professional

  @Column()
  tier: string; // free | pro | elite | business

  @Column('int')
  rateBasisPoints: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
