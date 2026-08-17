import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
