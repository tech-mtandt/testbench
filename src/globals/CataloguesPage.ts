import type { GlobalConfig } from 'payload'

/** The /catalogues page. The catalogues themselves live in the Catalogues collection. */
export const CataloguesPage: GlobalConfig = {
  slug: 'catalogues-page',
  label: 'Catalogues Page',
  admin: {
    group: 'Pages',
    description: 'The /catalogues page. Each catalogue is an item in Business > Catalogues (order is set there).',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Catalogues', admin: { description: 'Banner title and breadcrumb' } },
    { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
    {
      name: 'categories',
      type: 'array',
      label: 'Category filter',
      labels: { singular: 'Category', plural: 'Categories' },
      admin: {
        initCollapsed: true,
        description: 'Choices of the "Choose Category" filter, in order. They must match the catalogues\' category text.',
      },
      fields: [{ name: 'value', type: 'text', label: 'Category', required: true }],
    },
  ],
}
