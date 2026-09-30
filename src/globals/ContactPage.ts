import type { GlobalConfig } from 'payload'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
    description: 'The Contact Us page (/contact-us).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'Page title (read by screen readers; the banner artwork carries the visible title)' },
            },
            { name: 'banner', type: 'upload', relationTo: 'media', label: 'Banner image' },
            { name: 'heading', type: 'text', admin: { description: 'Heading above the contact form' } },
            { name: 'subheading', type: 'text', admin: { description: 'Small caption under the heading' } },
          ],
        },
        {
          label: 'Share your thoughts',
          description: 'Feedback strip below the contact form, and the form it opens',
          fields: [
            {
              name: 'share',
              type: 'group',
              label: false,
              fields: [
                { name: 'title', type: 'text' },
                { name: 'text', type: 'text' },
                { name: 'button', type: 'text', label: 'Button label' },
                { name: 'background', type: 'upload', relationTo: 'media', label: 'Background image' },
                { name: 'formTitle', type: 'text', label: 'Form title' },
                {
                  name: 'fields',
                  type: 'array',
                  label: 'Form fields',
                  labels: { singular: 'Field', plural: 'Form fields' },
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: { description: 'Internal key sent with the submission, e.g. fullName (no spaces)' },
                    },
                    { name: 'label', type: 'text', required: true },
                    {
                      name: 'type',
                      type: 'select',
                      defaultValue: 'text',
                      options: [
                        { label: 'Text', value: 'text' },
                        { label: 'Email', value: 'email' },
                        { label: 'Phone', value: 'tel' },
                        { label: 'Dropdown', value: 'select' },
                        { label: 'Long text', value: 'textarea' },
                      ],
                    },
                    { name: 'required', type: 'checkbox' },
                    {
                      name: 'options',
                      type: 'text',
                      hasMany: true,
                      admin: { description: 'Dropdown choices', condition: (_, row) => row?.type === 'select' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Offices',
          fields: [
            {
              name: 'regions',
              type: 'array',
              labels: { singular: 'Region', plural: 'Regions' },
              admin: { initCollapsed: true, description: 'Tabs above the office list, e.g. INDIA / OVERSEAS' },
              fields: [
                { name: 'name', type: 'text', required: true },
                {
                  name: 'cities',
                  type: 'array',
                  labels: { singular: 'City', plural: 'Cities' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    {
                      name: 'offices',
                      type: 'array',
                      labels: { singular: 'Office', plural: 'Offices' },
                      admin: { initCollapsed: true },
                      fields: [
                        { name: 'company', type: 'text' },
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                          admin: { description: 'e.g. Corporate Office, Headquarters, Mumbai Branch' },
                        },
                        { name: 'address', type: 'textarea' },
                        { name: 'phones', type: 'text', hasMany: true, label: 'Phone number(s)' },
                        { name: 'emails', type: 'text', hasMany: true, label: 'Email address(es)' },
                        {
                          name: 'map',
                          type: 'text',
                          label: 'Google Maps embed URL',
                          admin: { description: 'The src of the Google Maps "Embed a map" iframe' },
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
    },
  ],
}
