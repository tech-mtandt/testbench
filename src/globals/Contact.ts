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
          name: 'address',
          type: 'text',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email ID',
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
