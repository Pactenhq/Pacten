import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Immutable, auditable record of the platform commission taken on a payment.
 * There are intentionally NO update/delete paths for this entity —
 * financial records must be append-only.
 */
@Entity('platform_commissions')
export class PlatformCommission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentId: string;

  @Column()
  dealId: string;

  @Column()
  payerId: string;

  // The deal payee (creator/professional) whose earnings the commission is
  // deducted from. Nullable for rows recorded before the payee-side switch.
  @Column({ nullable: true })
  payeeId: string;

  @Column('int')
  rateBasisPoints: number;

  @Column('int')
  amountCents: number;

  @Column({ default: 'usd' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
