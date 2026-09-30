import type { CollectionConfig, Field } from 'payload'

import { basePageFields } from '../fields/basePageFields'
import { facetTypes } from './ProductAttributes'

// The shared title/slug/featuredImage/content fields, relabelled for the catalogue.
const base = (name: string, admin: Record<string, unknown> = {}, label?: string): Field => {
  const f = basePageFields.find((x) => 'name' in x && x.name === name)!
  return { ...f, ...(label ? { label } : {}), admin: { ...(f.admin ?? {}), ...admin } } as Field
}

// Older fields the site no longer reads (kept so existing data survives; replaced by the
// fields on the tabs above).
const hidden = { hidden: true }

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Products',
    useAsTitle: 'title',
    defaultColumns: ['title', 'mode', 'productCategory', 'subcategory', 'updatedAt'],
    description: 'Standard equipment pages at /product-detail/<slug>, listed on the buy/rent listing pages.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Product',
          fields: [
            base('title'),
            {
              name: 'modelNo',
              type: 'text',
              label: 'Model No',
            },
            base('featuredImage', { description: 'Main product image' }, 'Main image'),
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Image', plural: 'Gallery' },
              admin: {
                initCollapsed: true,
                description: 'Additional images shown as thumbnails on the product page',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            base('content', { description: 'Text next to the images' }, 'Description'),
            {
              type: 'row',
              fields: [
                {
                  name: 'productCategory',
                  type: 'relationship',
                  relationTo: 'product-categories',
                  label: 'Category',
                },
                {
                  name: 'subcategory',
                  type: 'text',
                  admin: { description: "Subcategory URL segment from the category's subcategories, e.g. scissor-lift" },
                },
              ],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'specifications',
              type: 'array',
              labels: { singular: 'Row', plural: 'Specifications' },
              admin: {
                initCollapsed: true,
                description: 'Rows of the Specifications tab (also used on the Compare page)',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'features',
              type: 'richText',
              label: 'Standard features',
              admin: { description: 'Standard Features tab (hidden when empty)' },
            },
            {
              name: 'optionsContent',
              type: 'richText',
              label: 'Options',
              admin: { description: 'Options tab (hidden when empty)' },
            },
            {
              name: 'applications',
              type: 'array',
              labels: { singular: 'Application', plural: 'Applications' },
              admin: { initCollapsed: true, description: 'Applications tab' },
              fields: [
                {
                  name: 'application',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'downloads',
              type: 'array',
              labels: { singular: 'Download', plural: 'Downloads' },
              admin: { initCollapsed: true, description: 'The first file is the Download tab brochure' },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  defaultValue: 'Brochure',
                },
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'documents',
                  required: true,
                },
              ],
            },
            {
              name: 'charts',
              type: 'array',
              labels: { singular: 'Chart', plural: 'Charts' },
              admin: { initCollapsed: true, description: 'Load/reach chart images for the Chart tab' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
            {
              name: 'related',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: 'Related products',
              admin: {
                isSortable: true,
                description: 'Shown under the product; when empty, other products of the same subcategory are shown',
              },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
          ],
        },
        {
          label: 'Listing & filters',
          fields: [
            {
              name: 'listingRow',
              type: 'array',
              label: 'Listing summary',
              labels: { singular: 'Row', plural: 'Listing summary' },
              admin: { initCollapsed: true, description: 'Up to three key specs shown on listing and search results' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'facets',
              type: 'group',
              label: 'Filters',
              admin: { description: 'Which listing-page filters match this product (values are managed under Filter values)' },
              fields: facetTypes.map(
                ({ label, value }): Field => ({
                  name: value,
                  type: 'relationship',
                  relationTo: 'product-attributes',
                  hasMany: true,
                  label,
                  filterOptions: { type: { equals: value } },
                }),
              ),
            },
            {
              type: 'collapsible',
              label: 'Sort values',
              admin: { description: 'Numbers used by the listing sort and working-height filter' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'workingHeight',
                      type: 'number',
                      admin: {
                        description: 'Working height, in meters',
                      },
                    },
                    {
                      name: 'machineWeight',
                      type: 'number',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'maxLiftingCapacity',
                      type: 'number',
                      admin: {
                        description: 'Max lifting capacity, in kg',
                      },
                    },
                    {
                      name: 'maxLiftingHeight',
                      type: 'number',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    base('slug', { position: 'sidebar', description: 'URL segment: /product-detail/<slug>' }),
    {
      name: 'mode',
      type: 'select',
      index: true,
      label: 'Buy or rent',
      options: [
        { label: 'Buy', value: 'buy' },
        { label: 'Rent', value: 'rent' },
      ],
      admin: { position: 'sidebar', description: 'Products without this are not shown on the site catalogue' },
    },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Position in product lists (lowest first)' },
    },
    {
      name: 'metaKeywords',
      type: 'text',
      label: 'SEO keywords',
      admin: { position: 'sidebar', description: 'Comma-separated meta keywords' },
    },
    {
      name: 'legacyId',
      type: 'number',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'ID on the old website',
        condition: (data) => data?.legacyId != null,
      },
    },
    {
      name: 'condition',
      type: 'select',
      options: [
        { label: 'New', value: 'New' },
        { label: 'Used', value: 'Used' },
      ],
      admin: hidden,
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      admin: hidden,
    },
    {
      name: 'country',
      type: 'text',
      admin: hidden,
    },
    {
      name: 'category',
      type: 'text',
      admin: hidden,
    },
    {
      name: 'primaryType',
      type: 'text',
      admin: hidden,
    },
    {
      name: 'powerType',
      type: 'text',
      admin: hidden,
    },
    {
      name: 'standardFeatures',
      type: 'array',
      admin: hidden,
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'options',
      type: 'array',
      admin: hidden,
      fields: [
        {
          name: 'option',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'chartImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        ...hidden,
        description: 'Optional capacity/reach chart image for the Chart tab',
      },
    },
  ],
}
