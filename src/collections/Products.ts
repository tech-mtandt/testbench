import type { CollectionConfig } from 'payload'

import { basePageFields } from '../fields/basePageFields'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Business',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    ...basePageFields,
    {
      name: 'condition',
      type: 'select',
      options: [
        { label: 'New', value: 'New' },
        { label: 'Used', value: 'Used' },
      ],
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'subcategory',
      type: 'text',
    },
    {
      name: 'primaryType',
      type: 'text',
    },
    {
      name: 'powerType',
      type: 'text',
    },
    {
      name: 'modelNo',
      type: 'text',
    },
    {
      name: 'workingHeight',
      type: 'number',
      admin: {
        description: 'Working height, in meters',
      },
    },
    {
      name: 'maxLiftingCapacity',
      type: 'number',
      admin: {
        description: 'Max lifting capacity, in kg',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
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
    {
      name: 'specifications',
      type: 'array',
      admin: {
        description:
          'Extra spec rows shown in the Specifications tab, in addition to the fields above (e.g. Platform Height, Machine Weight, SWL)',
      },
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
    {
      name: 'standardFeatures',
      type: 'array',
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
      fields: [
        {
          name: 'option',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'applications',
      type: 'array',
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
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
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
      name: 'chartImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional capacity/reach chart image for the Chart tab',
      },
    },
  ],
}
