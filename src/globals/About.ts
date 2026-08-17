import type { GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

export const About: GlobalConfig = {
  slug: 'about',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: baseGlobalFields,
}
