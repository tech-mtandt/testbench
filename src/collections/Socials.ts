import type { CollectionConfig } from 'payload'

export const Socials: CollectionConfig = {
  slug: 'socials',
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link (URL)',
    },
  ],
}
