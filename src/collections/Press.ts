import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Press: CollectionConfig = {
  slug: 'press',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
