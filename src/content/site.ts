/**
 * Contact details, socials and footer copy (scraped from www.mtandt.com, 2026-09-25).
 * Navigation lives in nav.ts. Candidates to move into a Payload `SiteSettings` global.
 */

export const contact = {
  phone: "+91 9090 1010 65",
  phoneHref: "tel:+919090101065",
  email: "marketing@mtandt.com",
  whatsapp: "https://wa.me/919090101065",
};

export type SocialKey = "linkedin" | "facebook" | "instagram" | "twitter" | "youtube";

export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/3908621/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/MtandtLimited" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/mtandtgroup/" },
  { key: "twitter", label: "Twitter", href: "https://twitter.com/Mtandt_Group" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/c/MtandtGroup" },
];

export const footer = {
  blurb:
    "[em-tee-and-tee] The absolute one-stop destination for your safety needs. Delivering the best of our products & services for five decades.",
  pronunciationAudio: "/legacy/imageFile/1651491975.mp3",
};
