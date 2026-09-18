"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type MediaItem = {
  id: number;
  title: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  badge: string | null;
  date: string | null;
};

type TabKey = "blogs" | "press" | "events" | "gallery";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "blogs",
    label: "Blogs",
    icon: (
      <path d="M4 4h16v12H8l-4 4V4z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    key: "press",
    label: "Press",
    icon: (
      <path
        d="M4 6h16v12H4zM4 10h16M8 6v-2h8v2"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: "events",
    label: "Events",
    icon: (
      <path
        d="M5 4h14v16H5zM5 9h14M8 2v4M16 2v4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: "gallery",
    label: "Gallery",
    icon: (
      <path
        d="M4 5h16v14H4zM4 15l4-4 3 3 5-5 4 4M9 9a1 1 0 100-2 1 1 0 000 2z"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function TabIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-4 w-4"
    >
      {children}
    </svg>
  );
}

function MediaCard({
  item,
  aspect = "aspect-[4/3]",
  className = "",
}: {
  item: MediaItem;
  aspect?: string;
  className?: string;
}) {
  return (
    <Link
      href={item.href}
      className={`group relative block overflow-hidden bg-black/5 ${aspect} ${className}`}
    >
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {item.badge && (
        <span className="absolute top-3 left-3 bg-black/70 px-2 py-1 text-xs text-white">
          {item.badge}
        </span>
      )}
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1">
        <p className="font-semibold text-white underline underline-offset-2">{item.title}</p>
        {item.date && <p className="text-xs text-white/70">{item.date}</p>}
      </div>
    </Link>
  );
}

export default function MediaTabs({
  items,
}: {
  items: Record<TabKey, MediaItem[]>;
}) {
  const [active, setActive] = useState<TabKey>("blogs");
  const activeItems = items[active];
  const [first, second, third, ...rest] = activeItems;

  return (
    <div>
      <div className="relative z-20 -mt-10 flex justify-center px-4">
        <div className="flex w-full max-w-2xl overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold ${
                active === tab.key ? "bg-black text-white" : "bg-primary-yellow text-black"
              }`}
            >
              <TabIcon>{tab.icon}</TabIcon>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="default-margin py-10">
        {activeItems.length === 0 ? (
          <p className="text-center text-black/60">No {active} yet.</p>
        ) : (
          <>
            {first && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <MediaCard item={first} aspect="aspect-[4/5]" className="lg:col-span-2 lg:h-full" />
                <div className="flex flex-col gap-6">
                  {second && <MediaCard item={second} aspect="aspect-[16/10]" className="flex-1" />}
                  {third && <MediaCard item={third} aspect="aspect-[16/10]" className="flex-1" />}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
