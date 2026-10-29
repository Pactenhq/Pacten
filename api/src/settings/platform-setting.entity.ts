import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Admin-editable platform settings (M4 — Basic platform settings).
 * One row per key; values are stored as text and parsed by readers.
 * source: 'seed' rows are recomputed from the matching env var (or the
 * built-in default) on every boot, so env config keeps working until an
 * admin edits the value; 'admin' rows are never overwritten by boot.
 */
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
