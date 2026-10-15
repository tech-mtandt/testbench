"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { NavItem } from "@/content/site";
import { ChevronDown, CloseIcon, MenuIcon } from "@/ui/Icons";

const topLinkClass =
  "flex h-16 items-center gap-1 text-[15px] font-semibold text-white no-underline transition-colors hover:text-brand";

/** Main navigation. Keyed on the path, so every navigation starts with all menus closed. */
export default function NavBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return <Menus key={pathname} items={items} />;
}

/** Closes a menu when one of its links is clicked (covers links to the current page). */
const closeOnLink = (close: () => void) => (e: React.MouseEvent) => {
  if ((e.target as HTMLElement).closest("a")) close();
};

function Menus({ items }: { items: NavItem[] }) {
  // Desktop: hovering previews a menu; clicking its button (or Enter/Space) pins it open until
  // the button is clicked again, Escape is pressed, focus leaves it or the user clicks elsewhere.
  const [open, setOpen] = useState<{ label: string; pinned: boolean } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const anyOpen = open !== null;

  useEffect(() => {
    if (!anyOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const nav = navRef.current;
      if (nav?.contains(document.activeElement)) nav.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus();
      setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anyOpen]);

  // Mobile menu: lock page scroll while open; Escape (or growing to the desktop layout) closes it.
  useEffect(() => {
    if (!mobileOpen) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    lenis?.stop();
    const close = () => setMobileOpen(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", close);
    return () => {
      html.style.overflow = "";
      lenis?.start();
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", close);
    };
  }, [mobileOpen, lenis]);

  return (
    <>
      {/* Desktop */}
      <nav ref={navRef} className="hidden lg:block" aria-label="Main" onClick={closeOnLink(() => setOpen(null))}>
        <ul className="flex items-center gap-6">
          {items.map((item) => (
            <li
              key={item.label}
              className={item.kind === "dropdown" ? "relative" : undefined}
              onMouseEnter={() =>
                item.kind !== "link" && setOpen((o) => (o?.label === item.label ? o : { label: item.label, pinned: false }))
              }
              onMouseLeave={() => setOpen((o) => (o?.pinned ? o : null))}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen((o) => (o?.label === item.label ? null : o));
              }}
            >
              {item.kind === "link" ? (
                <Link href={item.href} className={topLinkClass}>
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={topLinkClass}
                  aria-expanded={open?.label === item.label}
                  onClick={() =>
                    setOpen((o) => (o?.label === item.label && o.pinned ? null : { label: item.label, pinned: true }))
                  }
                >
                  {item.label}
                  <ChevronDown className={`h-3 w-3 transition-transform ${open?.label === item.label ? "rotate-180" : ""}`} />
                </button>
              )}

              {/* tabIndex -1: clicking blank space inside a panel keeps focus (and the menu) inside it */}
              {item.kind === "mega" && open?.label === item.label && (
                <div tabIndex={-1} className="absolute inset-x-0 top-full rounded-b-md border-t-4 border-brand bg-white shadow-xl outline-none">
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

              {item.kind === "dropdown" && open?.label === item.label && (
                <div
                  tabIndex={-1}
                  className="absolute right-0 top-full min-w-56 overflow-hidden rounded-b-md border-t-4 border-brand bg-white py-2 shadow-xl outline-none"
                >
                  {item.groups.flatMap((g) => g.links).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block px-5 py-2 text-sm text-ink no-underline hover:bg-brand-cream focus-visible:-outline-offset-2"
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
        ref={toggleRef}
        type="button"
        className="text-white lg:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
      </button>
      {mobileOpen && (
        // Positioned against the sticky <header>: starts right under it and fills the rest of the screen.
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          data-lenis-prevent
          onClick={closeOnLink(() => setMobileOpen(false))}
          className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-100%)] overflow-y-auto overscroll-contain bg-black px-4 pb-10 lg:hidden"
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
