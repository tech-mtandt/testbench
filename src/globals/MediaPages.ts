import type { Field, GlobalConfig } from 'payload'

const listingSeo = (name: string, label: string, path: string): Field => ({
  name,
  type: 'group',
  label,
  admin: { description: `Search-engine title and description for ${path}. Leave empty to keep the defaults.` },
  fields: [
    { name: 'title', type: 'text', label: 'Meta title', admin: { description: 'Used as-is (include "| MTandT" if wanted)' } },
    { name: 'description', type: 'textarea', label: 'Meta description' },
  ],
})

/** The Media section listings: /media (blogs), /media/press, /media/events and /media/gallery. */
export const MediaPages: GlobalConfig = {
  slug: 'media-pages',
  label: 'Media pages',
  admin: {
    group: 'Pages',
    description:
      'Shared banner and gallery for the Media section. Blogs, press releases and events are edited in Content. The SEO tab is for /media (the blogs list).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Banner & gallery',
          fields: [
            {
              name: 'banner',
              type: 'upload',
              relationTo: 'media',
              label: 'Banner image',
              admin: { description: 'Background of the "MEDIA" banner on all four media listings' },
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Gallery',
              labels: { singular: 'Gallery item', plural: 'Gallery items' },
              admin: { initCollapsed: true, description: 'Photos and videos on /media/gallery, in this order' },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'image',
                  options: [
                    { label: 'Image', value: 'image' },
                    { label: 'Video', value: 'video' },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { condition: (_, sibling) => sibling?.type !== 'video' },
                },
                {
                  name: 'videoUrl',
                  type: 'text',
                  label: 'Video URL',
                  admin: {
                    condition: (_, sibling) => sibling?.type === 'video',
                    description: 'YouTube embed address, e.g. https://www.youtube.com/embed/RgBMS3lRuhs',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Listing pages SEO',
          description: 'SEO for /media (the blogs list) is on the SEO tab.',
          fields: [
            listingSeo('pressSeo', 'Press list', '/media/press'),
            listingSeo('eventsSeo', 'Events list', '/media/events'),
            listingSeo('gallerySeo', 'Gallery', '/media/gallery'),
          ],
        },
      ],
    },
  ],
}
