import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
