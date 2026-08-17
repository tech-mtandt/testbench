import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
    },
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Job Title',
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Picture',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Administrator', value: 'administrator' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
        { label: 'Developer', value: 'developer' },
      ],
    },
  ],
}
