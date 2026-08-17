import type { GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    ...baseGlobalFields,
    {
      name: 'whyUs',
      type: 'array',
      label: 'Why Us',
      fields: [
        {
          name: 'tagline',
          type: 'text',
        },
        {
          name: 'excerpt',
          type: 'textarea',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      fields: [
        {
          name: 'message',
          type: 'textarea',
        },
        {
          name: 'author',
          type: 'text',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'clients',
      type: 'array',
      label: 'Clients',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
}
