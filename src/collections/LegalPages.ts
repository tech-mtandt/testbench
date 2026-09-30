import type { CollectionConfig } from 'payload'

/** Privacy policy, terms and similar text pages at /pages/<slug>. */
export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: { singular: 'Legal page', plural: 'Legal pages' },
  admin: {
    group: 'Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Heading of the page' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Page address: /pages/<slug>, e.g. privacy-policy' },
    },
    { name: 'crumb', type: 'text', label: 'Breadcrumb label', admin: { description: 'Defaults to the title' } },
    { name: 'content', type: 'richText', required: true },
  ],
}
