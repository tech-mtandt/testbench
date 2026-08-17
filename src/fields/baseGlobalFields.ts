import type { Field } from 'payload'

export const baseGlobalFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
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
