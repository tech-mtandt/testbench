import type { CollectionConfig } from 'payload'

import { caseStudyCardFields, slugField } from './Industries'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case Study', plural: 'Case Studies' },
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Case study pages at /casestudy/<slug>.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'banner',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Background image of the title banner' },
            },
            {
              name: 'blocks',
              type: 'array',
              label: 'Sections',
              labels: { singular: 'Section', plural: 'Sections' },
              admin: { initCollapsed: true, description: 'e.g. Challenges, Solution, Result' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'content', type: 'richText' },
              ],
            },
            {
              name: 'details',
              type: 'array',
              label: 'Project details',
              labels: { singular: 'Detail', plural: 'Project details' },
              admin: { initCollapsed: true, description: 'Rows of the "Project Detail" table, e.g. Location: Ghaziabad' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text' },
              ],
            },
            {
              name: 'download',
              type: 'upload',
              relationTo: 'documents',
              label: 'Downloadable case study (PDF)',
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
            {
              name: 'related',
              type: 'array',
              label: 'Related case study cards',
              labels: { singular: 'Case study card', plural: 'Related case study cards' },
              admin: { initCollapsed: true },
              fields: caseStudyCardFields,
            },
          ],
        },
      ],
    },
    slugField('Page address: /casestudy/<slug>.'),
  ],
}
