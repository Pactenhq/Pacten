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

  // Null for subscription payments: a subscription checkout has no deal.
  // (Billing History lists payments by payer, not by deal.) Made nullable
  // by the M5 staging fixpack — needs a TYPEORM_SYNC=true boot once.
  @Column({ nullable: true })
  dealId: string | null;

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
  // Unique: a checkout session settles exactly one Payment row — the
  // webhook and the return-path sync can land for the same session, and
  // the second writer must not create a duplicate (see
  // recordSubscriptionPayment). Nulls stay non-conflicting in Postgres.
  @Column({ nullable: true, unique: true })
  stripeCheckoutSessionId: string;

  // Renewal invoices: the Stripe invoice id (in_...). Unique: each
  // invoice settles exactly one Payment row — a redelivery or replay of
  // the same invoice.payment_succeeded event must not create a duplicate
  // (see recordRenewalPayment). Added by the M5 staging fixpack renewal
  // fix — needs the same one TYPEORM_SYNC=true boot as payments.dealId.
  // Nulls stay non-conflicting in Postgres.
  @Column({ nullable: true, unique: true })
  stripeInvoiceId: string;

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
