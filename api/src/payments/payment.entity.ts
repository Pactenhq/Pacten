import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  REQUIRES_ACTION = 'requires_action',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dealId: string;

  @Column()
  payerId: string;

  // Integer minor units (cents) — never floats for money.
  @Column('int')
  amountCents: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  // Live mode: the Stripe Checkout Session that collects this payment.
  // Null in demo mode (PaymentIntent simulation) and for legacy rows.
  @Column({ nullable: true })
  stripeCheckoutSessionId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // Idempotency-Key header value. Unique: retries return the same payment.
  @Column({ nullable: true, unique: true })
  idempotencyKey: string;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
