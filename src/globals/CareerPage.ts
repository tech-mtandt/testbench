import type { GlobalConfig } from 'payload'

export const CareerPage: GlobalConfig = {
  slug: 'career-page',
  label: 'Careers Page',
  admin: {
    group: 'Pages',
    description: 'The Careers page (/career). Job openings are edited under Business > Careers.',
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
              required: true,
              admin: { description: 'Title in the page banner, e.g. CAREERS' },
            },
            { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
            { name: 'heading', type: 'text' },
            { name: 'tagline', type: 'text' },
            { name: 'content', type: 'richText' },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Photo grid beside the text (4 images work best)' },
            },
          ],
        },
        {
          label: 'Interest form',
          fields: [
            {
              name: 'form',
              type: 'group',
              label: false,
              fields: [
                { name: 'title', type: 'text' },
                { name: 'subtitle', type: 'text' },
                {
                  name: 'functionalAreas',
                  type: 'text',
                  hasMany: true,
                  label: 'Functional area options',
                },
                {
                  name: 'education',
                  type: 'text',
                  hasMany: true,
                  label: 'Education options',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
