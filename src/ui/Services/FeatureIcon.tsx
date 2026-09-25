import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", "aria-hidden": true, ...p });

/** Inline stand-ins for the Font Awesome classes stored on legacy service features. */
export default function FeatureIcon({ icon, ...p }: P & { icon?: string | null }) {
  const n = icon ?? "";
  if (n.includes("laptop"))
    return (
      <svg {...base(p)} fill="currentColor">
        <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10H4zm2 2v6h12V7zM1 17h22v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
      </svg>
    );
  if (n.includes("group") || n.includes("users"))
    return (
      <svg {...base(p)} fill="currentColor">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 20c0-3.3 3.6-6 8-6s8 2.7 8 6v1H1zm17.5 1v-1c0-1.9-.8-3.6-2.1-4.9C20.1 15.5 23 17.5 23 20v1z" />
      </svg>
    );
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.3 3.3-1.4 1.4-3.9-3.9V6h2z" />
    </svg>
  );
}
