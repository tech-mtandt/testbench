import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import { landingPages, landingPath } from '../content/landing'
import { previewUrl } from '../cms/preview'

/**
 * Banner videos and text of the category and range landing pages (/aerial-work-platforms,
 * /aerial-work-platforms/boom-lifts, …). One entry per page; anything left empty keeps what the
 * page shows without an entry (src/content/landing.ts). Drafts autosave while editing and show
 * in the Live Preview panel; visitors see a change once it is published.
 */

const upload = (name: string, label: string, kind: 'video' | 'image', description: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label,
  filterOptions: { mimeType: { contains: kind } },
  admin: { description, width: '50%' },
})

// The list and the page titles show the page's name, not its key.
const setTitle: CollectionBeforeChangeHook = ({ data }) => {
  const page = landingPages.find((p) => p.key === data?.page)
  return page ? { ...data, title: page.label } : data
}

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  labels: { singular: 'Landing page', plural: 'Landing pages' },
  admin: {
    group: 'Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt'],
    description:
      'Banner videos and text of the category and range pages (e.g. Boom Lifts). Fields left empty keep what the page shows today. Changes save as a draft you can check in Live Preview; visitors see them after Publish.',
    livePreview: { url: ({ data, req }) => previewUrl(req, landingPath(data?.page)) },
    preview: (doc, { req }) => previewUrl(req, landingPath(doc?.page)),
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 25,
  },
  hooks: { beforeChange: [setTitle] },
  fields: [
    {
      name: 'page',
      type: 'select',
      required: true,
      unique: true,
      options: landingPages.map((p) => ({ label: p.label, value: p.key })),
      admin: { description: 'The page this changes.' },
    },
    { name: 'title', type: 'text', admin: { hidden: true } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Banner',
          description:
            'Short, muted, looping videos (10–15 s, MP4/H.264, no sound) with their first frame as the poster image. The banner takes the shape of the video, so the whole frame shows. Upload the files under Media first, or with Create New here.',
          fields: [
            {
              type: 'row',
              fields: [
                upload('wideVideo', 'Video for computers', 'video', '1920 × 800 px (landscape), under about 6 MB.'),
                upload('widePoster', 'Poster for computers', 'image', 'First frame of that video, 1920 × 800 px JPG. Shown while it loads.'),
              ],
            },
            {
              type: 'row',
              fields: [
                upload('tallVideo', 'Video for phones', 'video', '1080 × 1920 px (portrait), under about 4 MB.'),
                upload('tallPoster', 'Poster for phones', 'image', 'First frame of that video, 1080 × 1920 px JPG.'),
              ],
            },
          ],
        },
        {
          label: 'Text',
          fields: [
            { name: 'headline', type: 'text', admin: { description: 'The large heading in the banner, e.g. "Boom Lifts for Sale & Rent". Empty: the page\'s name.' } },
            { name: 'intro', type: 'textarea', admin: { description: 'One or two sentences under the heading. Empty: a standard line about buying or renting.' } },
            {
              name: 'facts',
              type: 'array',
              labels: { singular: 'Fact', plural: 'Facts' },
              maxRows: 5,
              admin: { description: 'Short points in the strip along the bottom of the banner, e.g. "Up to 42 m reach". Empty: Since 1974, Buy or rent, Operator training, Service & AMC.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              label: 'Page title (Google)',
              admin: { description: 'Shown as the headline in Google results, about 60 characters. Empty: the page keeps its current title.' },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Description (Google)',
              admin: { description: 'Shown under the title in Google results, about 155 characters. Empty: the page keeps its current description.' },
            },
          ],
        },
      ],
    },
  ],
}
