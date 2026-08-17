import type { CollectionConfig } from "payload";

export const Brands: CollectionConfig = {
  slug: "brands",
  admin: {
    group: "Admin",
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "category",
      type: "text",
    },
    {
      name: "link",
      type: "text",
    },
  ],
};
