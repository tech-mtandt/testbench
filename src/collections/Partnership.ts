import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Partnership: CollectionConfig = {
  slug: 'partnership',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
