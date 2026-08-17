"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type TeamMember = {
  id: string;
  name: string;
  designation?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

const INTERVAL_MS = 3000;
const TRANSITION_MS = 700;

function useItemsPerView(max: number) {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const columns = width >= 1024 ? 5 : width >= 768 ? 3 : width >= 640 ? 2 : 1;
      setItemsPerView(Math.max(1, Math.min(max, columns)));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max]);

  return itemsPerView;
}

export default function TeamCarousel({ members }: { members: TeamMember[] }) {
  const itemsPerView = useItemsPerView(members.length || 1);
  const canSlide = members.length > itemsPerView;

  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  useEffect(() => {
    setIndex(0);
  }, [itemsPerView, members.length]);

  useEffect(() => {
    if (!canSlide) return;
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [canSlide]);

  useEffect(() => {
    if (!canSlide || index !== members.length) return;
    const timeout = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [index, canSlide, members.length]);

  useEffect(() => {
    if (withTransition) return;
    const raf = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [withTransition]);

  if (members.length === 0) return null;

  const slides = canSlide ? [...members, ...members.slice(0, itemsPerView)] : members;

  return (
    <div className="overflow-hidden">
      <div
        className={`flex ${withTransition ? "transition-transform ease-in-out" : ""}`}
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transform: canSlide ? `translateX(-${index * (100 / itemsPerView)}%)` : undefined,
          justifyContent: canSlide ? undefined : "center",
        }}
      >
        {slides.map((member, i) => (
          <div
            key={`${member.id}-${i}`}
            className="flex flex-shrink-0 flex-col items-center gap-3 px-4 text-center"
            style={{ width: `${100 / itemsPerView}%` }}
          >
            <div className="relative h-40 w-40 overflow-hidden rounded-full bg-black/10">
              {member.imageUrl && (
                <Image
                  src={member.imageUrl}
                  alt={member.imageAlt || member.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <p className="font-bold">{member.name}</p>
            {member.designation && (
              <p className="text-sm text-black/60">{member.designation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
