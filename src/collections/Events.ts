import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    group: "Content",
    useAsTitle: "title",
  },
  access: {
    read: ({ req }) => {
      if (req.user) {
        return true;
      }

      return {
        _status: {
          equals: "published",
        },
      };
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "hero",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "thumbnail",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "body",
      type: "richText",
      required: true,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
    },
    {
      name: "category",
      type: "text",
    },
    {
      name: "publishedDate",
      type: "date",
      label: "Publish Date",
    },
    {
      name: "eventName",
      type: "text",
      required: true,
      label: "Event Name",
    },
    {
      name: "fromDate",
      type: "date",
      required: true,
      label: "From Date",
    },
    {
      name: "toDate",
      type: "date",
      required: true,
      label: "To Date",
    },
    {
      name: "location",
      type: "text",
      label: "Location",
    },
    {
      name: "map",
      type: "text",
    },
    {
      name: "stallNumber",
      type: "text",
      label: "Stall Number",
    },
  ],
};
