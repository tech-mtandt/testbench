import type { CollectionConfig } from 'payload'
import { EXPERIMENTAL_TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (req.user) {
        return true
      }

      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
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
      name: 'hero',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      // Some imported posts have comparison tables.
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
      }),
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Publish Date',
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Shown as tags at the bottom of the post' },
    },
  ],
}
