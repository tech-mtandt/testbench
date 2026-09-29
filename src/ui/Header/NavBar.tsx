"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/content/site";
import { ChevronDown, CloseIcon, MenuIcon } from "@/ui/Icons";

const topLinkClass =
  "flex h-16 items-center gap-1 text-[15px] font-semibold text-white no-underline transition-colors hover:text-brand";

export default function NavBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  // Close menus on navigation
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden lg:block" aria-label="Main">
        <ul className="flex items-center gap-6">
          {items.map((item) => (
            <li
              key={item.label}
              className={item.kind === "dropdown" ? "relative" : undefined}
              onMouseEnter={() => item.kind !== "link" && setOpen(item.label)}
              onMouseLeave={() => setOpen(null)}
            >
              {item.kind === "link" ? (
                <Link href={item.href} className={topLinkClass}>
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={topLinkClass}
                  aria-expanded={open === item.label}
                  onClick={() => setOpen(open === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}

              {item.kind === "mega" && open === item.label && (
                <div className="absolute inset-x-0 top-full border-t-4 border-brand bg-white shadow-xl">
                  <div className="default-margin grid grid-cols-4 gap-x-8 gap-y-6 py-8">
                    {item.groups.map((g) => (
                      <div key={g.label}>
                        <h6 className="mb-2 border-b border-neutral-200 pb-2 text-sm font-semibold uppercase">
                          {g.href ? (
                            <Link href={g.href} className="text-ink no-underline hover:text-ink-soft">
                              {g.label}
                            </Link>
                          ) : (
                            g.label
                          )}
                        </h6>
                        <ul className="space-y-1.5">
                          {g.links.map((l) => (
                            <li key={l.href} className="text-sm leading-snug">
                              <Link href={l.href} className="text-ink-soft no-underline hover:text-ink hover:underline">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.kind === "dropdown" && open === item.label && (
                <div className="absolute right-0 top-full min-w-56 border-t-4 border-brand bg-white py-2 shadow-xl">
                  {item.groups.flatMap((g) => g.links).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block px-5 py-2 text-sm text-ink no-underline hover:bg-brand-cream"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile */}
      <button
        type="button"
        className="text-white lg:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
      </button>
      {mobileOpen && (
        <nav
          aria-label="Mobile"
          className="fixed inset-x-0 bottom-0 top-[100px] z-50 overflow-y-auto bg-black px-4 pb-10 lg:hidden"
        >
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.label}>
                {item.kind === "link" ? (
                  <Link href={item.href} className="block py-3 font-semibold text-white no-underline">
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 font-semibold text-white"
                      aria-expanded={mobileSection === item.label}
                      onClick={() => setMobileSection(mobileSection === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileSection === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {mobileSection === item.label && (
                      <div className="space-y-4 pb-4 pl-3">
                        {item.groups.map((g) => (
                          <div key={g.label}>
                            {item.kind === "mega" && (
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                                {g.href ? (
                                  <Link href={g.href} className="text-brand no-underline">
                                    {g.label}
                                  </Link>
                                ) : (
                                  g.label
                                )}
                              </p>
                            )}
                            <ul>
                              {g.links.map((l) => (
                                <li key={l.href}>
                                  <Link href={l.href} className="block py-1 text-sm text-white/80 no-underline">
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
