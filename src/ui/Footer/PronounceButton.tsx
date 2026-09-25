"use client";

import { Volume2 } from "lucide-react";
import { useRef, useState } from "react";

/** Plays the "em-tee-and-tee" pronunciation clip. */
export default function PronounceButton({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Hear how to pronounce MT&T"
        onClick={() => audio.current?.play()}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
          playing ? "border-brand bg-brand text-ink" : "border-white/20 text-white hover:border-brand hover:text-brand"
        }`}
      >
        <Volume2 className="h-4 w-4" />
      </button>
      <audio ref={audio} src={src} preload="none" onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} />
    </>
  );
}
