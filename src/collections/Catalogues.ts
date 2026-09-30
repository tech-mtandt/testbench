import type { CollectionConfig } from 'payload'

export const Catalogues: CollectionConfig = {
  slug: 'catalogues',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'brand', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'subcategory',
      type: 'text',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'document',
      type: 'upload',
      relationTo: 'documents',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Position on the Catalogues page (lower first)' },
    },
  ],
}
