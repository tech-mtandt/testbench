import type { GlobalConfig } from 'payload'

/**
 * The /investor-relations page (formerly /annual-returns): one tab per company, with groups
 * such as Notice of General Meeting, Annual Return and Corporate Social Responsibility. The slug
 * keeps its old name because it is the database table name.
 */
export const AnnualReturnsPage: GlobalConfig = {
  slug: 'annual-returns-page',
  label: 'Investor Relations Page',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
    {
      name: 'tabs',
      type: 'array',
      labels: { singular: 'Company tab', plural: 'Company tabs' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'Company name on the tab' } },
        {
          name: 'groups',
          type: 'array',
          labels: { singular: 'Group', plural: 'Groups' },
          admin: { initCollapsed: true },
          fields: [
            { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "Notice of General Meeting", "Annual Return" or "Corporate Social Responsibility"' } },
            {
              name: 'docs',
              type: 'array',
              labels: { singular: 'Document', plural: 'Documents' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'file', type: 'upload', relationTo: 'documents', label: 'PDF' },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'Or link',
                      admin: { description: 'Used when no PDF is uploaded' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
