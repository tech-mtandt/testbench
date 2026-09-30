import type { GlobalConfig } from 'payload'

/** The /annual-returns page: one tab per company, grouped PDF links. */
export const AnnualReturnsPage: GlobalConfig = {
  slug: 'annual-returns-page',
  label: 'Annual Returns Page',
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
            { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "Annual Return"' } },
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
