"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/../public/logo.png";
import type { MenuGroup, TopItem } from "@/content/nav";
import { openPalette } from "@/ui/CommandPalette";
import { useEnquiry } from "@/ui/Enquiry";
import Img from "@/ui/Img";

export type NavData = {
  top: TopItem[];
  products: { slug: string; title: string; href: string; image: string | null; count: number; subs: { label: string; href: string }[] }[];
  services: MenuGroup[];
  company: MenuGroup[];
  phone: string;
  phoneHref: string;
};

type Panel = "products" | "services" | "company";

export default function NavBar({ data }: { data: NavData }) {
  const pathname = usePathname();
  const { open: openEnquiry } = useEnquiry();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setPanel(null);
    setMobile(false);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const enter = (p: Panel | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanel(p);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setPanel(null), 120);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className={`container-x transition-[padding] duration-500 ease-[var(--ease-out-expo)] ${scrolled ? "pt-2" : "pt-4"}`}>
        <div
          className={`pointer-events-auto relative rounded-full transition-[background-color,box-shadow,border-color] duration-500 ${
            scrolled || panel ? "glass shadow-[var(--shadow-soft)]" : "border border-transparent"
          }`}
          onMouseLeave={leave}
        >
          <div className="flex h-14 items-center gap-2 pr-2 pl-4 sm:h-16 sm:pl-5">
            <Link href="/" aria-label="MT&T home" className="mr-4 shrink-0">
              <Image src={Logo} alt="MT&T — Since 1974" height={36} className="h-8 w-auto sm:h-9" priority />
            </Link>

            <nav aria-label="Main" className="hidden flex-1 lg:block">
              <ul className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
                {data.top.map((item) => {
                  const p = "panel" in item ? item.panel : null;
                  const active = isActive(item.href) || panel === p;
                  return (
                    <li key={item.label} onMouseEnter={() => (enter(p), setHovered(item.label))}>
                      <Link
                        href={item.href}
                        aria-expanded={p ? panel === p : undefined}
                        className={`relative flex h-10 items-center gap-1 rounded-full px-4 text-[14px] font-medium no-underline transition-colors ${active ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                      >
                        {hovered === item.label && (
                          <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-ink/5" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
                        )}
                        <span className="relative">{item.label}</span>
                        {p && <ChevronDown className={`relative h-3.5 w-3.5 transition-transform duration-300 ${panel === p ? "rotate-180" : ""}`} />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openPalette()}
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-white/70 px-3 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink sm:pr-2 sm:pl-3.5"
                aria-label="Search (⌘K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
              </button>
              <a
                href={data.phoneHref}
                aria-label={`Call ${data.phone}`}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:flex"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="hidden h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink-2 sm:flex"
              >
                Get a quote
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white lg:hidden"
                aria-label={mobile ? "Close menu" : "Open menu"}
                aria-expanded={mobile}
                onClick={() => setMobile((v) => !v)}
              >
                {mobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {panel && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => enter(panel)}
                className="absolute inset-x-0 top-[calc(100%+8px)] hidden origin-top overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white shadow-[var(--shadow-lift)] lg:block"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={panel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    {panel === "products" && <ProductsPanel data={data} />}
                    {panel === "services" && <GroupsPanel groups={data.services} footer={{ label: "All services", href: "/services" }} />}
                    {panel === "company" && <GroupsPanel groups={data.company} described />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>{mobile && <MobileMenu data={data} onQuote={() => (setMobile(false), openEnquiry())} />}</AnimatePresence>
    </header>
  );
}

function ProductsPanel({ data }: { data: NavData }) {
  return (
    <div className="grid grid-cols-[1fr_260px]">
      <div className="grid grid-cols-4 gap-2 p-3">
        {data.products.map((c) => (
          <Link key={c.slug} href={c.href} className="group rounded-2xl p-3 no-underline transition-colors hover:bg-canvas">
            <div className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-canvas">
              {c.image && (
                <Img src={c.image} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
              )}
            </div>
            <p className="text-sm font-medium leading-tight text-ink">{c.title}</p>
            <p className="mt-0.5 font-mono text-[11px] text-subtle">{c.count} products</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-1 border-l border-line bg-canvas/60 p-5">
        <p className="eyebrow mb-3">Shop by need</p>
        {[
          { label: "Buy equipment", href: "/products?mode=buy", d: "New & certified machines" },
          { label: "Rent equipment", href: "/products?mode=rent", d: "Flexible terms, pan-India" },
          { label: "Compare models", href: "/products/compare", d: "Specs side by side" },
          { label: "Download catalogues", href: "/catalogues", d: "Brochures & spec sheets" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="group flex items-center justify-between rounded-xl px-3 py-2.5 no-underline hover:bg-white">
            <span>
              <span className="block text-sm font-medium text-ink">{l.label}</span>
              <span className="block text-xs text-muted">{l.d}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        ))}
        <Link href="/products" className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-ink no-underline">
          Browse all equipment <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function GroupsPanel({ groups, footer, described }: { groups: MenuGroup[]; footer?: { label: string; href: string }; described?: boolean }) {
  return (
    <div className="p-6">
      <div className={`grid gap-8 ${groups.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {groups.map((g) => (
          <div key={g.title}>
            {g.href ? (
              <Link href={g.href} className="group mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink no-underline">
                {g.title}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            ) : (
              <p className="eyebrow mb-3">{g.title}</p>
            )}
            <ul className="space-y-0.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-xl px-3 py-2 -mx-3 no-underline transition-colors hover:bg-canvas">
                    <span className="block text-sm text-ink-2">{l.label}</span>
                    {described && l.description && <span className="block text-xs text-muted">{l.description}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {footer && (
        <div className="mt-6 border-t border-line pt-4">
          <Link href={footer.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink no-underline">
            {footer.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ data, onQuote }: { data: NavData; onQuote: () => void }) {
  const [section, setSection] = useState<string | null>(null);
  const groups: Record<string, { label: string; href: string }[]> = {
    Equipment: [{ label: "All equipment", href: "/products" }, ...data.products.map((p) => ({ label: p.title, href: p.href }))],
    Services: [{ label: "All services", href: "/services" }, ...data.services.flatMap((g) => g.links)],
    Company: data.company.flatMap((g) => g.links),
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-auto fixed inset-0 top-0 z-[-1] overflow-y-auto bg-canvas px-4 pt-24 pb-10 lg:hidden"
      data-lenis-prevent
    >
      <ul className="divide-y divide-line border-y border-line">
        {data.top.map((item, i) => {
          const sub = groups[item.label];
          return (
            <motion.li key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.4 }}>
              {sub ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSection(section === item.label ? null : item.label)}
                    className="flex w-full items-center justify-between py-4 text-2xl font-semibold tracking-tight"
                    aria-expanded={section === item.label}
                  >
                    {item.label}
                    <ChevronDown className={`h-5 w-5 transition-transform ${section === item.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {section === item.label && (
                      <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        {sub.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} className="block py-2 text-base text-ink-2 no-underline">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                        <li className="h-3" />
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href={item.href} className="block py-4 text-2xl font-semibold tracking-tight text-ink no-underline">
                  {item.label}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>
      <div className="mt-8 grid gap-3">
        <button type="button" onClick={onQuote} className="flex h-13 items-center justify-center gap-2 rounded-full bg-brand text-base font-medium text-ink">
          Get a quote <ArrowRight className="h-4 w-4" />
        </button>
        <a href={data.phoneHref} className="flex h-13 items-center justify-center gap-2 rounded-full border border-line-strong text-base font-medium text-ink no-underline">
          <Phone className="h-4 w-4" /> {data.phone}
        </a>
      </div>
    </motion.div>
  );
}
