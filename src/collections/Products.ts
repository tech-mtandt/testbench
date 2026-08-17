import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
