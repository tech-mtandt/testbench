import type { Field, GlobalConfig } from 'payload'

const link = (): Field[] => [
  { name: 'label', type: 'text', required: true },
  { name: 'href', type: 'text', label: 'Link (URL or path)', required: true },
]

/** Header, navigation, footer, contact details and site-wide defaults. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Header & Footer',
  admin: {
    group: 'Site',
    description: 'Contact details, social links, main menu, footer and default page title/description used across the whole site.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'contact',
          label: 'Contact',
          description: 'Shown in the top bar, the footer "Call us" banner and the WhatsApp bubble.',
          fields: [
            { name: 'phone', type: 'text', label: 'Phone (as displayed)', required: true },
            {
              name: 'phoneHref',
              type: 'text',
              label: 'Phone link',
              required: true,
              admin: { description: 'e.g. tel:+919090101065' },
            },
            { name: 'email', type: 'text', label: 'Email', required: true },
            {
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp link',
              required: true,
              admin: { description: 'e.g. https://wa.me/919090101065' },
            },
          ],
        },
        {
          label: 'Social links',
          fields: [
            {
              name: 'socials',
              type: 'array',
              label: 'Social links',
              labels: { singular: 'Social link', plural: 'Social links' },
              admin: { initCollapsed: true, description: 'Icons in the top bar, footer and homepage.' },
              fields: [
                {
                  name: 'key',
                  type: 'select',
                  label: 'Network (icon)',
                  required: true,
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Twitter / X', value: 'twitter' },
                    { label: 'YouTube', value: 'youtube' },
                  ],
                },
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', label: 'Profile URL', required: true },
              ],
            },
          ],
        },
        {
          label: 'Main menu',
          fields: [
            {
              name: 'mainNav',
              type: 'array',
              label: 'Main menu',
              labels: { singular: 'Menu item', plural: 'Menu items' },
              admin: { initCollapsed: true, description: 'Top-level items of the header menu, in order.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'kind',
                  type: 'select',
                  label: 'Type',
                  required: true,
                  defaultValue: 'link',
                  options: [
                    { label: 'Simple link', value: 'link' },
                    { label: 'Mega menu (columns of links)', value: 'mega' },
                    { label: 'Dropdown (single list of links)', value: 'dropdown' },
                  ],
                },
                {
                  name: 'href',
                  type: 'text',
                  label: 'Link (URL or path)',
                  admin: { condition: (_, s) => s?.kind === 'link' },
                },
                {
                  name: 'groups',
                  type: 'array',
                  label: 'Columns',
                  labels: { singular: 'Column', plural: 'Columns' },
                  admin: {
                    initCollapsed: true,
                    condition: (_, s) => s?.kind !== 'link',
                    description: 'Mega menus show one column per entry; dropdowns list the links of every entry in one list.',
                  },
                  fields: [
                    { name: 'label', type: 'text', label: 'Heading', required: true },
                    { name: 'href', type: 'text', label: 'Heading link (optional)' },
                    {
                      name: 'links',
                      type: 'array',
                      labels: { singular: 'Link', plural: 'Links' },
                      admin: { initCollapsed: true },
                      fields: link(),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'footer',
          label: 'Footer',
          fields: [
            { name: 'blurb', type: 'textarea', label: 'About text', required: true },
            {
              name: 'pronunciationAudio',
              type: 'upload',
              relationTo: 'media',
              label: 'Pronunciation audio',
              admin: { description: 'The "em-tee-and-tee" clip played by the speaker button.' },
            },
            {
              name: 'columns',
              type: 'array',
              label: 'Link columns',
              labels: { singular: 'Column', plural: 'Columns' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  name: 'links',
                  type: 'array',
                  labels: { singular: 'Link', plural: 'Links' },
                  admin: { initCollapsed: true },
                  fields: link(),
                },
              ],
            },
            {
              name: 'legal',
              type: 'array',
              label: 'Bottom bar links',
              labels: { singular: 'Link', plural: 'Links' },
              admin: { initCollapsed: true, description: 'Next to the copyright line.' },
              fields: link(),
            },
          ],
        },
        {
          name: 'defaults',
          label: 'Site defaults',
          description: 'Used by pages that do not set their own title/description.',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Default page title',
              required: true,
              admin: { description: 'Other pages use "Page title | MTandT".' },
            },
            { name: 'description', type: 'textarea', label: 'Default meta description', required: true },
          ],
        },
      ],
    },
  ],
}
