import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Deal, DealStatus } from './deal.entity';

// PRD: DealTerm / DealVersion — every change to a deal's terms or status
// is captured as an immutable version snapshot, so the full history of
// what was proposed / negotiated / agreed is preserved.
@Entity('deal_versions')
export class DealVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealId' })
  deal: Deal;

  @Column()
  dealId: string;

  @Column()
  version: number;

  @Column({
    type: 'enum',
    enum: DealStatus,
  })
  status: DealStatus;

  @Column('text', { nullable: true })
  terms: string;

  @Column({ nullable: true })
  agreedBudget: string;

  @Column({ nullable: true })
  deadline: string;

  @Column('text', { nullable: true })
  deliverables: string;

  @Column({ nullable: true })
  changedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
