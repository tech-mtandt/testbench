import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: basePageFields,
}
