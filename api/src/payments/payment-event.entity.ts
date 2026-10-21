import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Every Stripe webhook event is stored before processing.
 * stripeEventId is unique so redelivered events are ignored (idempotent).
 */
@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ unique: true })
  stripeEventId: string;

  @Column()
  eventType: string;

  @Column('jsonb', { nullable: true })
  payload: any;

  @Column({ nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
