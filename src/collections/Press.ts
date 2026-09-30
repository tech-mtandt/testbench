import type { CollectionConfig } from 'payload'

export const Press: CollectionConfig = {
  slug: 'press',
  labels: {
    singular: 'Press',
    plural: 'Press',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'order', '_status'],
    description: 'Press releases, listed on /media/press (highest "Position" first). Each has its own page at /press/<slug>.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) {
        return true
      }

      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    // New releases go to the top of the list unless a position is given.
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && typeof data.order !== 'number') {
          const top = await req.payload.find({ collection: 'press', where: { order: { exists: true } }, sort: '-order', limit: 1, depth: 0, req })
          data.order = ((top.docs[0]?.order as number | null | undefined) ?? 0) + 1
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Heading on the press page' },
    },
    {
      name: 'cardTitle',
      type: 'text',
      label: 'Card title',
      admin: { description: 'Title on the card in the press list (defaults to the title)' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Page address: /press/<slug>' },
    },
    {
      name: 'hero',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: { description: 'Shown on the card and at the top of the press page' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: { hidden: true },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { hidden: true },
    },
    {
      name: 'category',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Publish Date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Shown as tags at the bottom of the press page' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Position',
      admin: {
        position: 'sidebar',
        description: 'Higher numbers show first in the press list. New releases are placed at the top automatically.',
      },
    },
  ],
}
