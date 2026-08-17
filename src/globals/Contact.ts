import type { GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: baseGlobalFields,
}
