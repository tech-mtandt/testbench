import type { CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, adminOrSelf, isEditor } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    // Only editors and admins can sign in to the admin panel; only admins manage accounts.
    admin: ({ req }) => isEditor(req),
    create: adminOnly,
    delete: adminOnly,
    update: adminOrSelf,
  },
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
      access: { create: adminOnlyField, update: adminOnlyField },
      options: [
        { label: 'Administrator', value: 'administrator' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
        { label: 'Developer', value: 'developer' },
      ],
    },
  ],
}
