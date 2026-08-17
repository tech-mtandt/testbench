import type { CollectionConfig } from 'payload'

export const Careers: CollectionConfig = {
  slug: 'careers',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
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
    },
  ],
}
