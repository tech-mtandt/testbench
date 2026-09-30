import * as migration_20260930_120000_seo_plugin from './20260930_120000_seo_plugin'

// The baseline (20260811_193641_baseline) is already marked applied in the
// database but was never committed; only migrations after it live here.
export const migrations = [
  {
    up: migration_20260930_120000_seo_plugin.up,
    down: migration_20260930_120000_seo_plugin.down,
    name: '20260930_120000_seo_plugin',
  },
]
