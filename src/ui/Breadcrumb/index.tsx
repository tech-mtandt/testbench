import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({
  items,
  variant = "dark",
}: {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  const linkClass = isLight ? "text-white/70 hover:text-white" : "text-black/60 hover:text-black";
  const mutedClass = isLight ? "text-white/70" : "text-black/60";
  const activeClass = isLight ? "font-medium text-white" : "font-medium text-black";
  const separatorClass = isLight ? "text-white/40" : "text-black/30";

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? activeClass : mutedClass}>{item.label}</span>
              )}
              {!isLast && <span className={separatorClass}>&gt;</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
