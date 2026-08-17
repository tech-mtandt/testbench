import type { GlobalConfig } from "payload";

import { baseGlobalFields } from "../fields/baseGlobalFields";

export const About: GlobalConfig = {
  slug: "about",
  admin: {
    group: "Pages",
  },
  access: {
    read: () => true,
  },
  fields: [
    ...baseGlobalFields,
    {
      name: "link",
      type: "text",
    },
    {
      name: "poweringProgressTagline",
      type: "text",
      label: "Powering Progress Tagline",
    },
    {
      name: "poweringProgressCards",
      type: "array",
      label: "Powering Progress Cards",
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
      ],
    },
    {
      name: "groupOfCompanies",
      type: "array",
      label: "MTANDT Group of Companies",
      fields: [
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "link",
          type: "text",
          defaultValue: "/",
        },
      ],
    },
    {
      name: "investors",
      type: "array",
      label: "Investors",
      fields: [
        {
          name: "user",
          type: "relationship",
          relationTo: "users",
          required: true,
        },
        {
          name: "designation",
          type: "text",
          label: "Designation (overrides job title)",
        },
      ],
    },
    {
      name: "management",
      type: "array",
      label: "Our Management",
      fields: [
        {
          name: "user",
          type: "relationship",
          relationTo: "users",
          required: true,
        },
        {
          name: "designation",
          type: "text",
          label: "Designation (overrides job title)",
        },
      ],
    },
  ],
};
