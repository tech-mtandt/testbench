import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "fromDate", "location", "_status"],
    description: "Trade shows and exhibitions, listed newest first on /media/events. Each has its own page at /event/<slug>.",
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
      admin: { description: "Page address: /event/<slug>" },
    },
    {
      name: "hero",
      type: "upload",
      relationTo: "media",
      label: "Event image",
      admin: { description: "Shown at the top of the event page" },
    },
    {
      name: "thumbnail",
      type: "upload",
      relationTo: "media",
      admin: { description: "Shown in the events list and the Recent Events sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "Short summary shown in the events list" },
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
      admin: { hidden: true },
    },
    {
      name: "category",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "publishedDate",
      type: "date",
      label: "Publish Date",
      admin: { hidden: true },
    },
    {
      // Unused by the site (the title is shown); kept for existing data.
      name: "eventName",
      type: "text",
      label: "Event Name",
      admin: { hidden: true },
    },
    {
      name: "fromDate",
      type: "date",
      required: true,
      label: "From Date",
      admin: { date: { pickerAppearance: "dayOnly" }, description: "Events are listed by this date, newest first" },
    },
    {
      name: "toDate",
      type: "date",
      label: "To Date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "location",
      type: "text",
      label: "Location",
    },
    {
      name: "map",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "stallNumber",
      type: "text",
      label: "Stall Number",
      admin: { hidden: true },
    },
    {
      name: "gallery",
      type: "array",
      label: "Photo gallery",
      labels: { singular: "Photo", plural: "Photos" },
      admin: { initCollapsed: true, description: "Photos shown under the event text (click to enlarge)" },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      admin: { description: "Shown as tags at the bottom of the event page" },
    },
  ],
};
