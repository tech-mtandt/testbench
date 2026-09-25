import type { ReactNode } from "react";
import Reveal from "./Reveal";

type Tone = "canvas" | "white" | "dark" | "none";
const tones: Record<Tone, string> = {
  canvas: "bg-canvas",
  white: "bg-white",
  dark: "bg-graphite text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white",
  none: "",
};

/** Page section with consistent vertical rhythm. `id` doubles as an anchor target. */
export function Section({
  children,
  tone = "none",
  className = "",
  id,
  tight,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${tight ? "py-12 sm:py-16" : "py-16 sm:py-24"} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}

/** Eyebrow + title + optional description and trailing action. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  dark,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      className={`mb-10 flex flex-col gap-6 sm:mb-14 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"} ${className}`}
    >
      <div className={align === "center" ? "max-w-3xl" : "max-w-2xl"}>
        {eyebrow && <p className={`eyebrow mb-4 ${dark ? "text-white/60" : ""}`}>{eyebrow}</p>}
        <h2 className="display-md">{title}</h2>
        {description && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-white/65" : "text-muted"}`}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
