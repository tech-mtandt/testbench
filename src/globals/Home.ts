import type { Field, GlobalConfig } from 'payload'

import { baseGlobalFields } from '../fields/baseGlobalFields'

/** Homepage headings/labels as they appear today. Used as field defaults and as the
 * frontend fallback when a heading is left empty. */
export const homeDefaults = {
  heading: 'Delivering Exceptionally Good Customer Experience',
  heroButtonLabel: 'Enquire now',
  heroButtonHref: '/contact-us',
  productsHeading: 'Products',
  brandsHeading: 'Our Brands',
  brandsTagline: 'Safety and Excellence in Meeting Diverse Need and Applications',
  serviceNavigatorHeading: 'Service Navigator',
  serviceNavigatorLinkLabel: 'Know More',
  whyUsHeading: 'Why Us',
  testimonialsHeading: 'Customer Testimonials',
  blogsHeading: 'Latest Blogs',
  blogsEmptyText: 'No posts yet.',
  socialHeading: 'Social Media',
  socialIntro: 'Follow Mtandt Group for project updates, events and product launches.',
  newsHeading: 'News and Events',
  clientsHeading: 'Our Clients',
}

type DefaultKey = keyof typeof homeDefaults

const text = (name: DefaultKey, label: string, description?: string): Field => ({
  name,
  type: 'text',
  label,
  defaultValue: homeDefaults[name],
  admin: { description: description ?? 'Leave empty to use the default shown on the site today.' },
})

// featuredImage / content are not shown on the homepage: kept (live data) but hidden.
const base = baseGlobalFields.map(
  (f) =>
    ('name' in f && f.name === 'title'
      ? { ...f, admin: { ...f.admin, description: 'Internal name of this page (not shown on the site).' } }
      : { ...f, admin: { ...f.admin, hidden: true } }) as Field,
)

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: {
    group: 'Pages',
    description: 'Everything on the homepage, one tab per section (top to bottom).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            ...base,
            text('heading', 'Main heading (H1)', 'The large heading under the search bar.'),
            {
              name: 'slides',
              type: 'array',
              label: 'Hero slides',
              labels: { singular: 'Slide', plural: 'Slides' },
              admin: { initCollapsed: true, description: 'Rotating banner at the top of the page.' },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Background image' },
                { name: 'eyebrow', type: 'text', label: 'Small text above the title' },
                {
                  name: 'titleLines',
                  type: 'array',
                  label: 'Title lines',
                  labels: { singular: 'Line', plural: 'Lines' },
                  admin: { description: 'Each line is shown on its own row.' },
                  fields: [{ name: 'value', type: 'text', label: 'Line', required: true }],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                text('heroButtonLabel', 'Slide button text'),
                text('heroButtonHref', 'Slide button link', 'Page the slide button opens, e.g. /contact-us.'),
              ],
            },
          ],
        },
        {
          label: 'Products',
          fields: [
            text('productsHeading', 'Section heading'),
            {
              name: 'productTabs',
              type: 'array',
              label: 'Product tabs',
              labels: { singular: 'Tab', plural: 'Tabs' },
              admin: { initCollapsed: true, description: 'Tabs of product cards; the first tab is shown first.' },
              fields: [
                { name: 'label', type: 'text', label: 'Tab label', required: true },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Products',
                  labels: { singular: 'Product', plural: 'Products' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'image', type: 'upload', relationTo: 'media' },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'Link',
                      admin: { description: 'Leave empty to link to a site search for the title.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Brands',
          fields: [
            text('brandsHeading', 'Section heading'),
            text('brandsTagline', 'Tagline'),
            {
              name: 'brandTabs',
              type: 'array',
              label: 'Brand tabs',
              labels: { singular: 'Tab', plural: 'Tabs' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'label', type: 'text', label: 'Tab label', required: true },
                {
                  name: 'brands',
                  type: 'array',
                  labels: { singular: 'Brand', plural: 'Brands' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'logo', type: 'upload', relationTo: 'media' },
                    { name: 'alt', type: 'text', label: 'Logo alt text' },
                    { name: 'title', type: 'text' },
                    { name: 'text', type: 'textarea', label: 'Description' },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'Link',
                      admin: { description: 'Page or website address. Leave empty for a card without a link.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Service Navigator',
          fields: [
            text('serviceNavigatorHeading', 'Section heading'),
            {
              name: 'serviceNavigator',
              type: 'group',
              label: false,
              fields: [
                { name: 'intro', type: 'textarea', label: 'Intro text' },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Services',
                  labels: { singular: 'Service', plural: 'Services' },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'text', type: 'textarea' },
                    { name: 'href', type: 'text', label: 'Link', required: true },
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { description: 'Not shown in the current design.' },
                    },
                  ],
                },
              ],
            },
            text('serviceNavigatorLinkLabel', 'Link text'),
          ],
        },
        {
          label: 'Why Us',
          fields: [
            text('whyUsHeading', 'Section heading'),
            {
              name: 'whyUs',
              type: 'array',
              label: 'Why Us',
              labels: { singular: 'Reason', plural: 'Reasons' },
              admin: { initCollapsed: true, description: 'Icons follow the order of the cards.' },
              fields: [
                {
                  name: 'tagline',
                  type: 'text',
                  label: 'Title',
                },
                {
                  name: 'excerpt',
                  type: 'textarea',
                  label: 'Text',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { hidden: true },
                },
              ],
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [
            text('testimonialsHeading', 'Section heading'),
            {
              name: 'testimonials',
              type: 'array',
              label: 'Testimonials',
              labels: { singular: 'Testimonial', plural: 'Testimonials' },
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'message',
                  type: 'textarea',
                  label: 'Quote',
                },
                {
                  name: 'author',
                  type: 'text',
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Blogs, Social & News',
          fields: [
            {
              type: 'row',
              fields: [
                text('blogsHeading', 'Blogs heading', 'The latest published blog is shown automatically.'),
                text('blogsEmptyText', 'Text when there are no blogs'),
              ],
            },
            text('socialHeading', 'Social media heading', 'The links come from Site settings.'),
            text('socialIntro', 'Social media intro'),
            text('newsHeading', 'News heading'),
            {
              name: 'news',
              type: 'array',
              label: 'News and events',
              labels: { singular: 'News item', plural: 'News items' },
              admin: { initCollapsed: true, description: 'Shown in this order.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'href', type: 'text', label: 'Link', required: true },
                {
                  name: 'date',
                  type: 'text',
                  admin: { description: 'Shown as written, e.g. 2026-03-21.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Clients',
          fields: [
            text('clientsHeading', 'Section heading'),
            {
              name: 'clients',
              type: 'array',
              label: 'Clients',
              labels: { singular: 'Client', plural: 'Clients' },
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'name',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
