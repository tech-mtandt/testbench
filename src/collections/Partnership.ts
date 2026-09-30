import type { CollectionConfig, Field } from 'payload'

import { basePageFields } from '../fields/basePageFields'

/** The shared page fields, with the unused image/content reused as the banner and intro. */
const pageFields: Field[] = basePageFields.map((f) => {
  if (!('name' in f)) return f
  if (f.name === 'title')
    return { ...f, admin: { ...f.admin, description: 'Shown on the banner and in the breadcrumb, e.g. "Dealer"' } } as Field
  if (f.name === 'slug')
    return { ...f, admin: { ...f.admin, description: 'Page address: customers, dealer or vendors' } } as Field
  if (f.name === 'featuredImage') return { ...f, label: 'Banner image' } as Field
  if (f.name === 'content') return { ...f, label: 'Intro text' } as Field
  return f
})

export const Partnership: CollectionConfig = {
  slug: 'partnership',
  labels: { singular: 'Partner form', plural: 'Partner forms' },
  admin: {
    group: 'Business',
    useAsTitle: 'title',
    description: 'Application forms for customers, dealers and vendors (/customers, /dealer, /vendors).',
  },
  access: {
    read: () => true,
  },
  fields: [
    ...pageFields.slice(0, 3),
    { name: 'heading', type: 'text', admin: { description: 'Heading above the intro text' } },
    ...pageFields.slice(3),
    { name: 'formTitle', type: 'text', label: 'Form title' },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Form section', plural: 'Form sections' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', admin: { description: 'Optional section heading' } },
            {
              name: 'level',
              type: 'select',
              label: 'Heading size',
              options: [
                { label: 'Section heading', value: '1' },
                { label: 'Sub-heading (smaller)', value: '2' },
              ],
            },
          ],
        },
        {
          name: 'fields',
          type: 'array',
          labels: { singular: 'Form field', plural: 'Form fields' },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { description: 'Unique key in the submitted form, e.g. company_name' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'inputType',
                  type: 'select',
                  label: 'Type',
                  defaultValue: 'text',
                  options: [
                    { label: 'Text', value: 'text' },
                    { label: 'Email', value: 'email' },
                    { label: 'Phone', value: 'tel' },
                    { label: 'Number', value: 'number' },
                    { label: 'Long text', value: 'textarea' },
                    { label: 'Dropdown', value: 'select' },
                    { label: 'Radio buttons', value: 'radio' },
                    { label: 'File upload', value: 'file' },
                  ],
                },
                {
                  name: 'span',
                  type: 'select',
                  label: 'Width',
                  defaultValue: '12',
                  options: [
                    { label: 'Quarter', value: '3' },
                    { label: 'Third', value: '4' },
                    { label: 'Half', value: '6' },
                    { label: 'Full', value: '12' },
                  ],
                },
                { name: 'required', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'options',
              type: 'text',
              hasMany: true,
              admin: {
                description: 'Choices (the first one is preselected in a dropdown)',
                condition: (_, sibling) => sibling?.inputType === 'select' || sibling?.inputType === 'radio',
              },
            },
            {
              type: 'row',
              admin: { condition: (_, sibling) => sibling?.inputType === 'file' },
              fields: [
                { name: 'accept', type: 'text', label: 'Allowed file types', admin: { description: 'e.g. .png,.pdf,.jpg,.jpeg' } },
                { name: 'hint', type: 'text', admin: { description: 'Small note beside the file input' } },
              ],
            },
            {
              name: 'showIf',
              type: 'group',
              label: 'Only show when',
              admin: { description: 'Optional: show this field only when a dropdown has a certain value' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'field', type: 'text', label: 'Dropdown field name' },
                    { name: 'value', type: 'text', label: 'Has the value' },
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
