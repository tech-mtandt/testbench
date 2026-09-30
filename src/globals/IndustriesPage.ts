import type { GlobalConfig } from 'payload'

export const IndustriesPage: GlobalConfig = {
  slug: 'industries-page',
  label: 'Industries Page',
  admin: {
    group: 'Pages',
    description: 'The /industries listing page. The industries themselves are edited under Business > Industries.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: { description: 'Heading in the title banner (leave empty for none)' },
            },
            { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
          ],
        },
      ],
    },
  ],
}
