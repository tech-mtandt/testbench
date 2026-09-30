import type { CollectionConfig, Field } from 'payload'

import { slugify } from './Careers'

/** Case study teaser cards (title, text, image, link) — shared with the case-studies collection. */
export const caseStudyCardFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  { name: 'text', type: 'textarea' },
  { name: 'image', type: 'upload', relationTo: 'media' },
  {
    name: 'link',
    type: 'text',
    admin: { description: 'Page the card opens, e.g. /casestudy/case-study-1 (leave empty for no link)' },
  },
]

export const slugField = (description: string): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: `${description} Filled in from the title when left empty.` },
  hooks: {
    beforeValidate: [({ value, data }) => value || slugify(data?.title) || undefined],
  },
})

export const Industries: CollectionConfig = {
  slug: 'industries',
  labels: { singular: 'Industry', plural: 'Industries' },
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'updatedAt'],
    description: 'Industries listed on /industries, each with its own page at /industries/<slug>.',
  },
  defaultSort: 'order',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Listing card',
          description: 'How this industry appears on the /industries page',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'cardText',
              type: 'textarea',
              label: 'Card text',
            },
            {
              name: 'icon',
              type: 'select',
              options: [
                { label: 'Train', value: 'train' },
                { label: 'Parking (aviation)', value: 'parking' },
                { label: 'Car', value: 'car' },
                { label: 'Light bulb', value: 'bulb' },
                { label: 'Building', value: 'building' },
                { label: 'Warehouse', value: 'warehouse' },
                { label: 'Calendar', value: 'calendar' },
                { label: 'Wheelchair', value: 'wheelchair' },
              ],
            },
          ],
        },
        {
          label: 'Page',
          fields: [
            {
              name: 'banner',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Background image of the title banner' },
            },
            { name: 'heading', type: 'text' },
            { name: 'content', type: 'richText' },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Images shown beside the text' },
            },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Gallery image', plural: 'Gallery' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'title', type: 'text' },
              ],
            },
            {
              name: 'caseStudies',
              type: 'array',
              label: 'Case study cards',
              labels: { singular: 'Case study card', plural: 'Case study cards' },
              admin: { initCollapsed: true },
              fields: caseStudyCardFields,
            },
            {
              name: 'clients',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Client logos',
            },
          ],
        },
      ],
    },
    slugField('Page address: /industries/<slug>.'),
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Position on the /industries page (lower first)' },
    },
  ],
}
