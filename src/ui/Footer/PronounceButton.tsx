"use client";

import { useRef } from "react";
import { VolumeIcon } from "@/ui/Icons";

/** Plays the "em-tee-and-tee" pronunciation clip, as on the live footer. */
export default function PronounceButton({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label="Hear how to pronounce MT&T"
        onClick={() => audio.current?.play()}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white hover:border-brand hover:text-brand"
      >
        <VolumeIcon className="h-4 w-4" />
      </button>
      <audio ref={audio} src={src} preload="none" />
    </>
  );
}
