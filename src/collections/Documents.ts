import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
  fields: [],
}
