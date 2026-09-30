import type { Field } from 'payload'

/** Original path of a file imported from the old website (e.g. /legacy/imageFile/x.jpg).
 * The site keeps serving that path (and its pre-optimised variants); uploading a
 * replacement file into a field creates a new document without it. */
export const legacySrcField: Field = {
  name: 'legacySrc',
  type: 'text',
  index: true,
  admin: {
    readOnly: true,
    position: 'sidebar',
    description: 'Imported from the old website',
    condition: (data) => Boolean(data?.legacySrc),
  },
}
