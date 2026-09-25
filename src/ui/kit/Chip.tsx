import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium no-underline transition-colors duration-300";
const on = "border-ink bg-ink text-white";
const off = "border-line bg-white text-ink-2 hover:border-ink/40";

/** Filter / navigation chip. Renders a Link when `href` is set, otherwise a button. */
export default function Chip({
  active,
  href,
  onClick,
  children,
  count,
  scroll,
}: {
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
  scroll?: boolean;
}) {
  const inner = (
    <>
      {children}
      {count !== undefined && <span className={`font-mono text-[11px] ${active ? "text-white/60" : "text-subtle"}`}>{count}</span>}
    </>
  );
  const cls = `${base} ${active ? on : off}`;
  if (href)
    return (
      <Link href={href} scroll={scroll} className={cls} aria-current={active ? "page" : undefined}>
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls} aria-pressed={active}>
      {inner}
    </button>
  );
}
