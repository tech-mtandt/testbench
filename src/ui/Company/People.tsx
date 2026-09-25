import FallbackImg from "@/ui/Catalogue/FallbackImg";
import { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { unitOf } from "./lib";

export type Person = {
  id: string;
  name: string;
  designation?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  /** Local legacy copy, used if the Payload media URL fails to load. */
  fallbackUrl?: string | null;
};

const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

/** Round-portrait people grid. Hover lifts the card, brings the portrait to full colour and reveals the unit. */
export default function People({ people, size = "md" }: { people: Person[]; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <Stagger
      gap={0.04}
      className={`grid gap-3 sm:gap-4 ${lg ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"}`}
    >
      {people.map((p) => {
        const unit = unitOf(p.designation);
        return (
          <StaggerItem key={p.id}>
            <article
              className={`group card relative flex h-full flex-col items-center overflow-hidden text-center transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)] ${
                lg ? "p-8 sm:flex-row sm:items-center sm:gap-6 sm:text-left" : "p-5"
              }`}
            >
              <div
                className={`relative shrink-0 overflow-hidden rounded-full bg-canvas ring-1 ring-line ${lg ? "h-28 w-28 sm:h-32 sm:w-32" : "aspect-square w-full max-w-[148px]"}`}
              >
                <span aria-hidden className="absolute inset-0 flex items-center justify-center font-mono text-xl text-subtle">
                  {initials(p.name)}
                </span>
                <FallbackImg
                  src={p.imageUrl}
                  fallback={p.fallbackUrl}
                  alt={p.imageAlt || p.name}
                  className="relative h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute inset-0 rounded-full ring-0 ring-brand ring-inset transition-[box-shadow] duration-500 group-hover:ring-4" />
              </div>
              <div className={lg ? "mt-5 min-w-0 sm:mt-0" : "mt-4 min-w-0"}>
                <h3 className={lg ? "text-xl" : "text-[15px] leading-snug"}>{p.name}</h3>
                {p.designation && <p className={`mt-1 text-muted ${lg ? "text-sm" : "text-[12.5px] leading-snug"}`}>{p.designation}</p>}
                {unit && (
                  <p className="mt-3 inline-flex translate-y-1 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {unit}
                  </p>
                )}
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
