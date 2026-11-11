import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * In-app notification types. One row per recipient per event. The set
 * mirrors the events that already trigger a transactional email (plus
 * the application decision and subscription activation, which have no
 * email) — see NotificationsService call sites. Pure account emails
 * (verification, password reset) are intentionally NOT notification
 * types: the user is not logged in when those fire.
 */
export enum NotificationType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_DECISION = 'application_decision',
  CONTRACT_SENT = 'contract_sent',
  CONTRACT_AWAITING_SIGNATURE = 'contract_awaiting_signature',
  CONTRACT_ACCEPTED = 'contract_accepted',
  CONTRACT_DECLINED = 'contract_declined',
  PAYMENT_RECEIVED = 'payment_received',
  PAYOUT_REQUESTED = 'payout_requested',
  PAYOUT_DECIDED = 'payout_decided',
  REFERRAL_EARNING = 'referral_earning',
  DISPUTE_FILED = 'dispute_filed',
  DISPUTE_RESOLVED = 'dispute_resolved',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  NEW_MESSAGE = 'new_message',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Recipient. Plain id column only — the list endpoints must never load
  // the full user relation (see the M5 QA public-profile email leak, F8).
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  body: string;

  // Frontend route the item navigates to (e.g. /dashboard/contracts/:id).
  @Column({ nullable: true })
  link: string | null;

  // Id of the related entity (application, contract, deal, dispute, …).
  @Column({ nullable: true })
  relatedId: string | null;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
