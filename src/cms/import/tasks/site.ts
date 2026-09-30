import { contact, footer, mainNav, siteDefaults, socials } from "@/content/site";

import { fillGlobal, media, onceTask } from "../helpers";
import type { ImportTask } from "../types";

export const siteTasks: ImportTask[] = [
  onceTask("site-settings", "Header & Footer", (ctx) =>
    fillGlobal(ctx, "site-settings", async () => ({
      contact: { ...contact },
      socials: socials.map((s) => ({ ...s })),
      mainNav: mainNav.map((item) =>
        item.kind === "link"
          ? { label: item.label, kind: item.kind, href: item.href }
          : {
              label: item.label,
              kind: item.kind,
              groups: item.groups.map((g) => ({
                label: g.label,
                href: g.href,
                links: g.links.map((l) => ({ ...l })),
              })),
            },
      ),
      footer: {
        blurb: footer.blurb,
        pronunciationAudio: await media(ctx, footer.pronunciationAudio, "MT&T pronunciation"),
        columns: footer.columns.map((c) => ({ title: c.title, links: c.links.map((l) => ({ ...l })) })),
        legal: footer.legal.map((l) => ({ ...l })),
      },
      defaults: { ...siteDefaults },
    })),
  ),
];
