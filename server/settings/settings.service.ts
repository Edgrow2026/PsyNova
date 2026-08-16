import { PlatformSettings } from '../../lib/types';
import { initialPlatformSettings } from '../../lib/mockData';

export class SettingsService {
  private settings: PlatformSettings = { ...initialPlatformSettings };

  getSettings(): PlatformSettings {
    return this.settings;
  }

  updateSettings(data: Partial<PlatformSettings>): PlatformSettings {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }
}
