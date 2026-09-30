import type { CollectionConfig } from 'payload'

/** "Hotels & Buildings" -> "hotels-and-buildings" */
export const slugify = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Careers: CollectionConfig = {
  slug: 'careers',
  labels: { singular: 'Job Opening', plural: 'Careers' },
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'isOpen', 'order', 'updatedAt'],
    description: 'Job openings listed on the Careers page (/career). Only openings marked "Currently Open" are shown.',
  },
  defaultSort: 'order',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Job Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Filled in from the job title when left empty',
      },
      hooks: {
        beforeValidate: [({ value, data }) => value || slugify(data?.title) || undefined],
      },
    },
    {
      name: 'department',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'employmentType',
      type: 'select',
      label: 'Employment Type',
      options: [
        { label: 'Full-time', value: 'full-time' },
        { label: 'Part-time', value: 'part-time' },
        { label: 'Contract', value: 'contract' },
        { label: 'Internship', value: 'internship' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Shown when a visitor expands the job on the Careers page',
      },
    },
    {
      name: 'applyLink',
      type: 'text',
      label: 'Apply Link (URL)',
    },
    {
      name: 'postedDate',
      type: 'date',
      label: 'Posted Date',
    },
    {
      name: 'isOpen',
      type: 'checkbox',
      label: 'Currently Open',
      defaultValue: true,
      admin: {
        description: 'Untick to hide this job from the Careers page',
      },
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Lower numbers are listed first',
      },
    },
  ],
}
