import * as migration_20260930_120000_seo_plugin from './20260930_120000_seo_plugin'
import * as migration_20261001_000000_cms_connect from './20261001_000000_cms_connect'
import * as migration_20261026_120000_landing_pages from './20261026_120000_landing_pages'
import * as migration_20261028_120000_buy_rent from './20261028_120000_buy_rent'

// The baseline (20260811_193641_baseline) is already marked applied in the
// database but was never committed; only migrations after it live here.
export const migrations = [
  {
    up: migration_20260930_120000_seo_plugin.up,
    down: migration_20260930_120000_seo_plugin.down,
    name: '20260930_120000_seo_plugin',
  },
  {
    up: migration_20261001_000000_cms_connect.up,
    down: migration_20261001_000000_cms_connect.down,
    name: '20261001_000000_cms_connect',
  },
  {
    up: migration_20261026_120000_landing_pages.up,
    down: migration_20261026_120000_landing_pages.down,
    name: '20261026_120000_landing_pages',
  },
  {
    up: migration_20261028_120000_buy_rent.up,
    down: migration_20261028_120000_buy_rent.down,
    name: '20261028_120000_buy_rent',
  },
]
