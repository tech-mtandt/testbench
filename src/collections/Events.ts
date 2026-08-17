import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
