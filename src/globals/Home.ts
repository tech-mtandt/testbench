import type { GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: baseGlobalFields,
}
