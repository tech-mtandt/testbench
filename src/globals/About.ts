import type { Field, GlobalConfig } from "payload";

import { baseGlobalFields } from "../fields/baseGlobalFields";

const svgField = (name: string, label: string, description: string): Field => ({
  name,
  type: "code",
  label,
  admin: { language: "html", description },
});

export const About: GlobalConfig = {
  slug: "about",
  admin: {
    group: "Pages",
    description: "The About Us page (/about-us). Empty sections show the original website's content.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Who we are",
          fields: [
            ...baseGlobalFields,
            {
              name: "link",
              type: "text",
              admin: { description: "YouTube video shown beside the text" },
            },
          ],
        },
        {
          label: "Principles",
          fields: [
            { name: "principlesTitle", type: "text", label: "Section title" },
            {
              name: "principles",
              type: "array",
              labels: { singular: "Principle", plural: "Principles" },
              admin: { initCollapsed: true },
              fields: [
                { name: "prefix", type: "text", admin: { description: 'Small word above the title, e.g. "Our"' } },
                { name: "title", type: "text", required: true },
                { name: "content", type: "richText" },
                svgField("icon", "Icon (SVG code)", "Inline SVG markup shown in the top corner of the card"),
                svgField("art", "Illustration (SVG code)", "Inline SVG markup shown at the bottom of the card"),
              ],
            },
          ],
        },
        {
          label: "Powering progress",
          fields: [
            { name: "poweringProgressTitle", type: "text", label: "Section title" },
            {
              name: "poweringProgressTagline",
              type: "text",
              label: "Powering Progress Tagline",
            },
            {
              name: "poweringProgressCards",
              type: "array",
              label: "Powering Progress Cards",
              admin: { initCollapsed: true },
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
          ],
        },
        {
          label: "Group companies",
          fields: [
            { name: "companiesTitle", type: "text", label: "Section title" },
            {
              name: "groupOfCompanies",
              type: "array",
              label: "MTANDT Group of Companies",
              admin: { initCollapsed: true },
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
          ],
        },
        {
          label: "Team",
          fields: [
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
        },
        {
          label: "Why MTandT",
          fields: [
            {
              name: "why",
              type: "group",
              label: false,
              fields: [
                { name: "title", type: "text", label: "Section title" },
                {
                  name: "points",
                  type: "array",
                  labels: { singular: "Point", plural: "Points" },
                  admin: { initCollapsed: true },
                  fields: [{ name: "value", type: "textarea", label: "Text", required: true }],
                },
                { name: "image", type: "upload", relationTo: "media" },
                { name: "background", type: "upload", relationTo: "media", label: "Background image" },
                {
                  name: "bullet",
                  type: "upload",
                  relationTo: "media",
                  label: "Bullet icon",
                  admin: { description: "Small icon shown before each point" },
                },
              ],
            },
          ],
        },
        {
          label: "Journey",
          fields: [
            {
              name: "journey",
              type: "group",
              label: false,
              fields: [
                { name: "title", type: "text", label: "Section title" },
                { name: "intro", type: "textarea" },
                { name: "background", type: "upload", relationTo: "media", label: "Background image" },
                {
                  name: "road",
                  type: "upload",
                  relationTo: "media",
                  label: "Timeline road image",
                  admin: { description: "Artwork drawn under each year" },
                },
                {
                  name: "items",
                  type: "array",
                  label: "Milestones",
                  labels: { singular: "Milestone", plural: "Milestones" },
                  admin: { initCollapsed: true },
                  fields: [
                    { name: "year", type: "text", required: true },
                    { name: "title", type: "text" },
                    { name: "text", type: "textarea", admin: { description: "Shown on hover" } },
                    { name: "image", type: "upload", relationTo: "media", admin: { description: "Shown on hover" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Accreditations & awards",
          fields: [
            {
              name: "accreditations",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "text", type: "textarea" },
                { name: "logos", type: "upload", relationTo: "media", hasMany: true },
                { name: "background", type: "upload", relationTo: "media", label: "Background image" },
              ],
            },
            {
              name: "awards",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "text", type: "textarea" },
                { name: "images", type: "upload", relationTo: "media", hasMany: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
