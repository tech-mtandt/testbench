import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-ink hover:bg-brand-600 shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)]",
  dark: "bg-ink text-white hover:bg-ink-2",
  outline: "border border-line-strong bg-white/60 text-ink hover:border-ink hover:bg-white",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-white text-ink hover:bg-brand",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-[15px] gap-2.5",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className = "") =>
  `group/btn inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap no-underline transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; className?: string; children?: ReactNode };

/** Pill button. Pass `href` to render a Next <Link> (external URLs get target=_blank). */
export function Button({
  variant,
  size,
  icon,
  className,
  children,
  href,
  ...rest
}: Common & ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">) | (Common & { href?: undefined } & ComponentProps<"button">)) {
  const cls = buttonClass(variant, size, className);
  const inner = (
    <>
      {children}
      {icon && <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5">{icon}</span>}
    </>
  );
  if (href !== undefined) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external)
      return (
        <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {inner}
        </a>
      );
    return (
      <Link href={href} className={cls} {...(rest as Omit<ComponentProps<typeof Link>, "href">)}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as ComponentProps<"button">)}>
      {inner}
    </button>
  );
}
