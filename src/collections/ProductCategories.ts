import type { CollectionConfig } from 'payload'

/** Equipment categories: the /category-by-subcategory/<slug> landing pages and the
 * category/subcategory structure behind the product listings. */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: { singular: 'Product Category', plural: 'Product Categories' },
  admin: {
    group: 'Products',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'updatedAt'],
    description: 'Category pages at /category-by-subcategory/<slug>, with their subcategory tabs and FAQs.',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Category',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { description: 'Page heading' } },
            {
              name: 'crumb',
              type: 'text',
              label: 'Short name',
              admin: { description: 'Used in breadcrumbs and the category filter (defaults to the title)' },
            },
            { name: 'intro', type: 'textarea', admin: { description: 'Paragraph under the heading' } },
            {
              name: 'subcategories',
              type: 'array',
              labels: { singular: 'Subcategory', plural: 'Subcategories' },
              admin: {
                initCollapsed: true,
                description: 'Tabs on the category page; each also has buy/rent listing pages',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    {
                      name: 'slug',
                      type: 'text',
                      required: true,
                      admin: { description: 'URL segment, e.g. scissor-lift' },
                    },
                  ],
                },
                { name: 'html', type: 'richText', label: 'Tab text' },
                {
                  name: 'button',
                  type: 'group',
                  admin: { description: 'Button under the tab text (leave the label empty for none)' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text' },
                        {
                          name: 'href',
                          type: 'text',
                          label: 'Link',
                          admin: { description: 'Leave empty when "Choose buy or rent" is ticked' },
                        },
                      ],
                    },
                    {
                      name: 'choose',
                      type: 'checkbox',
                      label: 'Choose buy or rent',
                      admin: { description: 'Opens a popup linking to the buy and rent listings' },
                    },
                  ],
                },
                {
                  name: 'faqs',
                  type: 'array',
                  label: 'FAQs',
                  labels: { singular: 'FAQ', plural: 'FAQs' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'q', type: 'text', label: 'Question', required: true },
                    { name: 'a', type: 'richText', label: 'Answer' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL segment, e.g. aerial-work-platform' },
    },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Position in category lists (lowest first)' },
    },
    {
      name: 'aliases',
      type: 'text',
      hasMany: true,
      label: 'Old URL names',
      admin: {
        position: 'sidebar',
        description: 'Other category URL segments that redirect here (from /categoryBySubcategory/<name>)',
      },
    },
    {
      name: 'metaKeywords',
      type: 'text',
      label: 'SEO keywords',
      admin: { position: 'sidebar', description: 'Comma-separated meta keywords' },
    },
  ],
}
