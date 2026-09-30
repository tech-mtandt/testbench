import type { CollectionConfig } from 'payload'

/** Engineered-solution pages: /custom-product-detail-<buy|rental>/<category>/<slug>. */
export const CustomProducts: CollectionConfig = {
  slug: 'custom-products',
  labels: { singular: 'Custom Product', plural: 'Custom Products' },
  admin: {
    group: 'Products',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'category', 'slug', 'updatedAt'],
    description:
      'Solution pages at /custom-product-detail-buy/<category>/<slug> and /custom-product-detail-rental/… (the same slug may exist once for buy and once for rent).',
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
            { name: 'hero', type: 'upload', relationTo: 'media', label: 'Banner image' },
            {
              name: 'crumb',
              type: 'group',
              label: 'Breadcrumb',
              admin: { description: 'Middle breadcrumb link, e.g. the category page' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text' },
                    { name: 'href', type: 'text', label: 'Link' },
                  ],
                },
              ],
            },
            { name: 'intro', type: 'richText', label: 'Introduction' },
            {
              name: 'specs',
              type: 'array',
              label: 'Specifications',
              labels: { singular: 'Row', plural: 'Specifications' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text' },
                  ],
                },
              ],
            },
            { name: 'features', type: 'richText' },
            { name: 'benefits', type: 'richText' },
            { name: 'download', type: 'upload', relationTo: 'documents', label: 'Brochure (PDF)' },
          ],
        },
        {
          label: 'Journey & gallery',
          fields: [
            {
              name: 'journey',
              type: 'array',
              label: 'Customer journey',
              labels: { singular: 'Step', plural: 'Steps' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'html', type: 'richText', label: 'Text' },
              ],
            },
            {
              name: 'gallery',
              type: 'group',
              label: 'Application & Industries gallery',
              admin: { description: 'Hidden when it has no images and no filters' },
              fields: [
                {
                  name: 'filters',
                  type: 'array',
                  labels: { singular: 'Filter', plural: 'Filters' },
                  admin: { initCollapsed: true, description: 'Filter buttons above the gallery' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true },
                        {
                          name: 'filterId',
                          type: 'text',
                          required: true,
                          label: 'ID',
                          admin: { description: 'Referenced by the images below' },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Images',
                  labels: { singular: 'Image', plural: 'Images' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', required: true },
                    { name: 'title', type: 'text' },
                    { name: 'caption', type: 'textarea' },
                    {
                      name: 'filters',
                      type: 'text',
                      hasMany: true,
                      admin: { description: 'Filter IDs this image belongs to' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'related',
              type: 'array',
              label: 'Related products',
              labels: { singular: 'Related product', plural: 'Related products' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'href', type: 'text', required: true, label: 'Link' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              name: 'clients',
              type: 'array',
              label: 'Client logos',
              labels: { singular: 'Logo', plural: 'Client logos' },
              admin: { initCollapsed: true },
              fields: [{ name: 'logo', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Buy', value: 'buy' },
        { label: 'Rent', value: 'rental' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL segment; unique per Buy/Rent' },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: { position: 'sidebar', description: 'Category URL segment, e.g. fall-protection-lifeline-systems' },
    },
    {
      name: 'altCategories',
      type: 'text',
      hasMany: true,
      label: 'Other category URLs',
      admin: { position: 'sidebar', description: 'Legacy category segments that also show this page' },
    },
    {
      name: 'productId',
      type: 'text',
      label: 'Enquiry product ID',
      admin: { position: 'sidebar', description: 'Sent with enquiries from this page' },
    },
    {
      name: 'metaKeywords',
      type: 'text',
      label: 'SEO keywords',
      admin: { position: 'sidebar', description: 'Comma-separated meta keywords' },
    },
  ],
}
