import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn()
  key: string;

  @Column('text')
  value: string;

  @Column({ default: 'seed' })
  source: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
