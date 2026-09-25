import type { SVGProps } from "react";
import type { SocialKey } from "@/content/site";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  ...props,
});

export const PhoneIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
  </svg>
);

export const MailIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
  </svg>
);

export const ChevronDown = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const CalendarIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const MapPinIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const QuoteIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M7.2 6C4.4 7.5 3 9.8 3 13v5h6v-6H6c0-2 1-3.5 3-4.5zm9 0c-2.8 1.5-4.2 3.8-4.2 7v5h6v-6h-3c0-2 1-3.5 3-4.5z" />
  </svg>
);

export const VolumeIcon = (p: P) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const WhatsAppIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8s-.39-.13-.56.12-.64.8-.78.97-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33a.45.45 0 0 0-.02-.42c-.06-.13-.56-1.35-.77-1.85s-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1 2.58 11.1 11.1 0 0 0 4.26 3.76c1.58.68 2.2.74 3 .62a2.55 2.55 0 0 0 1.67-1.18 2.07 2.07 0 0 0 .15-1.18c-.06-.1-.23-.17-.48-.29z" />
  </svg>
);

const socialPaths: Record<SocialKey, string> = {
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.1 1.43-2.1 2.9V21h-4z",
  facebook:
    "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5A.5.5 0 0 1 14.5 8z",
  instagram:
    "M12 7.4A4.6 4.6 0 1 0 16.6 12 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm5.9-7.8a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1zM21 8.1a5.3 5.3 0 0 0-1.45-3.7A5.3 5.3 0 0 0 15.9 3C14.4 2.9 9.6 2.9 8.1 3a5.3 5.3 0 0 0-3.7 1.44A5.3 5.3 0 0 0 3 8.1c-.1 1.5-.1 6.3 0 7.8a5.3 5.3 0 0 0 1.45 3.7A5.3 5.3 0 0 0 8.1 21c1.5.1 6.3.1 7.8 0a5.3 5.3 0 0 0 3.7-1.45A5.3 5.3 0 0 0 21 15.9c.1-1.5.1-6.3 0-7.8zm-2 9.4a3 3 0 0 1-1.7 1.7c-1.2.47-4 .36-5.3.36s-4.1.1-5.3-.36a3 3 0 0 1-1.7-1.7C4.5 16.3 4.6 13.5 4.6 12s-.1-4.3.36-5.3a3 3 0 0 1 1.7-1.7C7.9 4.5 10.7 4.6 12 4.6s4.1-.1 5.3.36a3 3 0 0 1 1.7 1.7c.47 1.2.36 4 .36 5.3s.1 4.1-.36 5.3z",
  twitter:
    "M22 5.9a8.2 8.2 0 0 1-2.36.65 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.6 11.6 0 0 1 3.4 4.75a4.1 4.1 0 0 0 1.27 5.47 4.1 4.1 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67v-.53A8.3 8.3 0 0 0 22 5.9z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z",
};

export const SocialIcon = ({ name, ...p }: P & { name: SocialKey }) => (
  <svg {...base(p)} fill="currentColor">
    <path d={socialPaths[name]} />
  </svg>
);
