import type { Field } from 'payload'

export const basePageFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
  },
  {
    name: 'featuredImage',
    type: 'upload',
    relationTo: 'media',
  },
  {
    name: 'content',
    type: 'richText',
  },
]
