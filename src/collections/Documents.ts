import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    group: 'Business',
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
  fields: [],
}
