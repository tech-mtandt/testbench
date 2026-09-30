import type { CollectionConfig } from 'payload'

/** The filter groups on the product listing pages (keys match the site's facet keys). */
export const facetTypes = [
  { label: 'Product condition', value: 'condition' },
  { label: 'Country', value: 'country' },
  { label: 'Primary type', value: 'primaryType' },
  { label: 'Power type', value: 'powerType' },
  { label: 'Application', value: 'application' },
  { label: 'Industry', value: 'industry' },
  { label: 'Brand', value: 'brand' },
] as const

export type FacetType = (typeof facetTypes)[number]['value']

/** Values offered in the listing-page filters (e.g. Country: India). Products pick them on
 * their "Listing & filters" tab. */
export const ProductAttributes: CollectionConfig = {
  slug: 'product-attributes',
  labels: { singular: 'Filter value', plural: 'Filter values' },
  admin: {
    group: 'Products',
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'legacyId'],
    listSearchableFields: ['label'],
    description: 'Options shown in the filters on product listing pages (condition, country, type, brand…).',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'id',
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      label: 'Filter',
      options: [...facetTypes],
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Text shown next to the checkbox' },
    },
    {
      name: 'legacyId',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'ID on the old website (keeps existing filter links working)',
        condition: (data) => Boolean(data?.legacyId),
      },
    },
  ],
}
