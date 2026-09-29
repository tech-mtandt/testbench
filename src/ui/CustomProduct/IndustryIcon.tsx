import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 21l1.5-4M15 21l-1.5-4" />
      <circle cx="9" cy="13.5" r=".6" fill="currentColor" />
      <circle cx="15" cy="13.5" r=".6" fill="currentColor" />
    </>
  ),
  parking: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" />
    </>
  ),
  car: (
    <>
      <path d="M3 17v-4l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5v4H3Z" />
      <path d="M3 13h18M5 17v2M19 17v2" />
      <circle cx="7" cy="15" r=".6" fill="currentColor" />
      <circle cx="17" cy="15" r=".6" fill="currentColor" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
    </>
  ),
  building: <path d="M3 21h18M4 10h16M12 3 3 8v2h18V8l-9-5ZM6 10v8M10 10v8M14 10v8M18 10v8M4 18h16" />,
  warehouse: <path d="M3 21V8l9-5 9 5v13M7 21v-9h10v9M7 15h10M7 18h10" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
    </>
  ),
  wheelchair: (
    <>
      <circle cx="11" cy="4" r="1.5" />
      <path d="M11 7v6h5l2 5M11 10h4" />
      <path d="M8.5 11.5a5 5 0 1 0 7 6" />
    </>
  ),
};

export default function IndustryIcon({ name, ...p }: Omit<SVGProps<SVGSVGElement>, "name"> & { name: string | null }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      {paths[name ?? ""] ?? paths.building}
    </svg>
  );
}
