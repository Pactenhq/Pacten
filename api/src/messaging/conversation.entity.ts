import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participant1Id' })
  participant1: User;

  @Column()
  participant1Id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participant2Id' })
  participant2: User;

  @Column()
  participant2Id: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  campaignId: string;

  @Column({ nullable: true })
  applicationId: string;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
