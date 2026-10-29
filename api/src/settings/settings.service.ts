import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from './platform-setting.entity';

export interface SettingDef {
  key: string;
  label: string;
  description: string;
  defaultValue: number;
}

export const SETTING_DEFS: SettingDef[] = [
  {
    key: 'FREE_BRAND_JOB_LIMIT',
    label: 'Free job posts per brand',
    description:
      'Total campaigns a free brand can own. Paid plans bypass this cap.',
    defaultValue: 1,
  },
  {
    key: 'FREE_BRAND_HIRE_LIMIT',
    label: 'Free hires per brand',
    description:
      'Total deals a free brand can create. Paid plans bypass this cap.',
    defaultValue: 1,
  },
  {
    key: 'FREE_APPLICATION_LIMIT',
    label: 'Free applications per creator/professional',
    description:
      'Total applications a free creator or professional can send. Paid plans bypass this cap.',
    defaultValue: 5,
  },
  {
    key: 'FREE_MESSAGE_LIMIT',
    label: 'Free messages per month',
    description:
      'Messages a free user can send per calendar month. Placeholder number — the client has not given the final value yet. Paid plans bypass this cap.',
    defaultValue: 50,
  },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private cache = new Map<string, number>();

  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingsRepo: Repository<PlatformSetting>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    for (const def of SETTING_DEFS) {
      const computed = this.envOrDefault(def);
      const existing = await this.settingsRepo.findOne({
        where: { key: def.key },
      });
      if (!existing) {
        await this.settingsRepo.save(
          this.settingsRepo.create({
            key: def.key,
            value: String(computed),
            source: 'seed',
          }),
        );
        this.logger.log(`Seeded setting ${def.key}=${computed}`);
      } else if (existing.source !== 'admin' && existing.value !== String(computed)) {
        // Seed rows track the env var, so low-limit test instances and
        // operator env changes keep working until an admin edits a value.
        existing.value = String(computed);
        await this.settingsRepo.save(existing);
      }
    }
    await this.refreshCache();
  }

  private envOrDefault(def: SettingDef): number {
    const raw = parseInt(this.config.get<string>(def.key) ?? '', 10);
    return Number.isFinite(raw) && raw >= 0 ? raw : def.defaultValue;
  }

  private async refreshCache() {
    const rows = await this.settingsRepo.find();
    const next = new Map<string, number>();
    for (const r of rows) {
      const n = parseInt(r.value, 10);
      if (Number.isFinite(n) && n >= 0) next.set(r.key, n);
    }
    this.cache = next;
  }

  /**
   * Sync read for request-time cap checks. The cache is loaded at boot
   * and refreshed on every update, so it is current for this instance.
   */
  getCachedNumber(key: string): number | undefined {
    return this.cache.get(key);
  }

  async list() {
    const rows = await this.settingsRepo.find();
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return SETTING_DEFS.map((def) => {
      const row = byKey.get(def.key);
      return {
        ...def,
        value: row ? parseInt(row.value, 10) : def.defaultValue,
        source: row?.source ?? 'seed',
      };
    });
  }

  async update(values: Record<string, unknown>) {
    const defs = new Map(SETTING_DEFS.map((d) => [d.key, d]));
    for (const [key, raw] of Object.entries(values ?? {})) {
      const def = defs.get(key);
      if (!def) throw new BadRequestException(`Unknown setting: ${key}`);
      const n =
        typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
      if (!Number.isInteger(n) || n < 0) {
        throw new BadRequestException(
          `${key} must be a whole number of 0 or more`,
        );
      }
      await this.settingsRepo.save({
        key,
        value: String(n),
        source: 'admin',
      });
    }
    await this.refreshCache();
    return this.list();
  }
}
