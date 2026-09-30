import type { CollectionConfig, Condition } from 'payload'

const isDetail: Condition = (data) => data?.kind !== 'hub'
const isHub: Condition = (data) => data?.kind === 'hub'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'kind', 'order'],
  },
  access: {
    read: () => true,
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
      name: 'kind',
      type: 'select',
      label: 'Page layout',
      options: [
        { label: 'Service page', value: 'detail' },
        { label: 'Brand hub (CESL, EQUIPR, EAT)', value: 'hub' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Service page: banner, text, image and features. Brand hub: logo, about, service cards and "why choose us". Leave empty to keep showing the built-in copy of the old website.',
      },
    },
    // ---------- listing card (/services) ----------
    {
      name: 'showInListing',
      type: 'checkbox',
      label: 'Show on the Services page',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Position on the Services page (lower first)' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short teaser shown on hover over the service card in the listing grid',
      },
    },
    {
      name: 'button',
      type: 'text',
      label: 'Card button text',
      admin: { description: 'Button on the service card in the listing grid, e.g. "READ MORE"' },
    },
    {
      name: 'hero',
      type: 'upload',
      relationTo: 'media',
      label: 'Card image',
      admin: { description: 'Image of the service card in the listing grid' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner image',
      admin: { description: 'Banner at the top of the service page', condition: isDetail },
    },
    // ---------- service page ----------
    {
      name: 'category',
      type: 'text',
      label: 'Banner title',
      admin: {
        description: 'Large title on the banner, e.g. "EQUIPMENT MANAGEMENT"',
        condition: isDetail,
      },
    },
    {
      name: 'crumbs',
      type: 'array',
      label: 'Breadcrumb',
      labels: { singular: 'Breadcrumb link', plural: 'Breadcrumb links' },
      admin: { initCollapsed: true, condition: isDetail, description: 'Shown on the banner, left to right' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', label: 'Link', admin: { description: 'Leave empty for plain text' } },
      ],
    },
    {
      name: 'heading',
      type: 'text',
      admin: { condition: isDetail, description: 'Heading above the text (defaults to the title)' },
    },
    {
      name: 'subheading',
      type: 'text',
      admin: { condition: isDetail },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Main text',
      admin: { condition: isDetail },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Legacy text (old database)',
      admin: {
        condition: isDetail,
        description: 'Imported from the old database. When it holds real text it is shown instead of the Main text.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: isDetail, description: 'Image beside the text' },
    },
    {
      name: 'features',
      type: 'array',
      labels: { singular: 'Feature', plural: 'Features' },
      admin: { initCollapsed: true, condition: isDetail, description: 'Icon boxes below the text' },
      fields: [
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Clock', value: 'fas fa-clock' },
            { label: 'Laptop', value: 'fa fa-laptop' },
            { label: 'Group of people', value: 'fa fa-group' },
          ],
        },
        { name: 'title', type: 'text' },
        { name: 'text', type: 'richText' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Call to action',
      admin: { condition: isDetail, description: 'Optional line and button below the features' },
      fields: [
        { name: 'text', type: 'text' },
        { name: 'label', type: 'text', label: 'Button text' },
        { name: 'href', type: 'text', label: 'Button link' },
      ],
    },
    // ---------- brand hub ----------
    {
      name: 'hub',
      type: 'group',
      label: 'Brand hub',
      admin: { condition: isHub },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'logoAlt', type: 'text', label: 'Logo alt text' },
          ],
        },
        { name: 'tagline', type: 'text' },
        { name: 'aboutTitle', type: 'text', label: 'About title' },
        { name: 'aboutText', type: 'richText', label: 'About text' },
        {
          type: 'row',
          fields: [
            { name: 'aboutImage', type: 'upload', relationTo: 'media', label: 'About image' },
            { name: 'aboutImageAlt', type: 'text', label: 'About image alt text' },
          ],
        },
        {
          name: 'offer',
          type: 'group',
          label: 'Services section',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'intro', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              labels: { singular: 'Service card', plural: 'Service cards' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea' },
                { name: 'href', type: 'text', label: 'Link' },
                {
                  type: 'row',
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media' },
                    { name: 'alt', type: 'text', label: 'Image alt text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'why',
          type: 'group',
          label: '"Why choose us" section',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'intro', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              labels: { singular: 'Reason', plural: 'Reasons' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text' },
                { name: 'text', type: 'textarea' },
              ],
            },
          ],
        },
        {
          name: 'supported',
          type: 'group',
          label: 'Supported equipment section',
          admin: { description: 'Optional; hidden when the title is empty' },
          fields: [
            { name: 'title', type: 'text' },
            { name: 'intro', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media' },
                { name: 'alt', type: 'text', label: 'Image alt text' },
              ],
            },
            { name: 'text', type: 'richText' },
          ],
        },
      ],
    },
    {
      name: 'brochure',
      type: 'upload',
      relationTo: 'documents',
      admin: { description: 'PDF behind the "Downloads" button (optional)' },
    },
  ],
}
