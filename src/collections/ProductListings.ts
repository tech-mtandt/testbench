import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

/** Keep `path` (the public URL, used for the SEO preview and admin list) in sync. */
const setPath: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const mode = data.mode ?? originalDoc?.mode
  const sub = data.subcategory ?? originalDoc?.subcategory
  const rel = data.productCategory ?? originalDoc?.productCategory
  const catId = rel && typeof rel === 'object' ? rel.id : rel
  if (!mode || !sub || !catId) return data
  try {
    const cat = await req.payload.findByID({ collection: 'product-categories', id: catId, depth: 0, req })
    if (cat?.slug) data.path = `/product-category-${mode}/${cat.slug}/${sub}`
  } catch {
    /* category missing; leave path as is */
  }
  return data
}

/** One buy or rent listing page per subcategory: /product-category-<buy|rental>/<category>/<subcategory>. */
export const ProductListings: CollectionConfig = {
  slug: 'product-listings',
  labels: { singular: 'Product Listing', plural: 'Product Listings' },
  admin: {
    group: 'Products',
    useAsTitle: 'title',
    defaultColumns: ['title', 'mode', 'path', 'updatedAt'],
    description:
      'Listing pages with filters: /product-category-buy/<category>/<subcategory> and /product-category-rental/…',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [setPath],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Listing',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { description: 'Page heading' } },
            { name: 'description', type: 'textarea', admin: { description: 'Paragraph under the heading' } },
            {
              name: 'products',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              admin: {
                description: 'Products listed, in this order (drag to reorder)',
                isSortable: true,
              },
              filterOptions: ({ data }) =>
                data?.mode ? { mode: { equals: data.mode === 'rental' ? 'rent' : 'buy' } } : true,
            },
            {
              name: 'sorts',
              type: 'array',
              label: 'Sort options',
              labels: { singular: 'Sort option', plural: 'Sort options' },
              admin: { initCollapsed: true, description: 'Choices in the "Sort by" dropdown; the first is the default' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    {
                      name: 'field',
                      type: 'select',
                      required: true,
                      label: 'Sort by',
                      options: [
                        { label: 'Working height', value: 'working_height' },
                        { label: 'Machine weight', value: 'machine_weight' },
                        { label: 'Max lifting capacity', value: 'mhe_maxliftingcapacity' },
                        { label: 'Max lifting height', value: 'mhe_maxliftingheight' },
                        { label: 'Stowed width (no data, keeps order)', value: 'stowed_dimensions' },
                      ],
                    },
                    {
                      name: 'dir',
                      type: 'select',
                      required: true,
                      label: 'Direction',
                      defaultValue: 'desc',
                      options: [
                        { label: 'Highest first', value: 'desc' },
                        { label: 'Lowest first', value: 'asc' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'columns',
              type: 'text',
              hasMany: true,
              admin: { description: 'Spec column names of this listing (reference only)' },
            },
          ],
        },
      ],
    },
    {
      name: 'mode',
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
      name: 'productCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      label: 'Category',
      admin: { position: 'sidebar' },
    },
    {
      name: 'subcategory',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar', description: "Subcategory URL segment from the category's subcategories, e.g. scissor-lift" },
    },
    {
      name: 'path',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Page URL (set automatically)' },
    },
    {
      name: 'metaKeywords',
      type: 'text',
      label: 'SEO keywords',
      admin: { position: 'sidebar', description: 'Comma-separated meta keywords' },
    },
  ],
}
