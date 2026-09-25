import type { GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    ...baseGlobalFields,
    {
      name: 'locations',
      type: 'array',
      label: 'Locations',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'e.g. "Corporate Office", "Headquarters", "Retail Office"',
          },
        },
        {
          name: 'address',
          type: 'richText',
        },
        {
          name: 'phones',
          type: 'text',
          label: 'Phone Number(s)',
          hasMany: true,
        },
        {
          name: 'emails',
          type: 'text',
          label: 'Email ID(s)',
          hasMany: true,
        },
        {
          name: 'maps',
          type: 'text',
          label: 'Maps (URL)',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
        },
      ],
    },
  ],
}
