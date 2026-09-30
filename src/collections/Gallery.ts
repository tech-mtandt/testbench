import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  // Unused: the /media/gallery items live on the "Media pages" global (Pages group).
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    hidden: true,
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
