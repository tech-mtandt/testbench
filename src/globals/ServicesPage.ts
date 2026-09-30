import type { GlobalConfig } from 'payload'

/** The /services listing page. The cards come from the Services collection. */
export const ServicesPage: GlobalConfig = {
  slug: 'services-page',
  label: 'Services Page',
  admin: {
    group: 'Pages',
    description: 'The /services page. Each card is a service in Business > Services (order and card text are set there).',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Services', admin: { description: 'Heading and breadcrumb' } },
    { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
  ],
}
