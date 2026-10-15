"use client";

import ReactLenis from "lenis/react";
import "lenis/dist/lenis.css";

// Wheel/touch over a native <dialog> (modals) scrolls the dialog, not the page behind it.
const inDialog = (node: HTMLElement) => node.nodeName === "DIALOG";

export default function Smooth({ children }: any) {
  return (
    <ReactLenis
      root
      // allowNestedScroll: inner scroll areas (lists, menus, tables) get the wheel while they can still scroll.
      options={{ lerp: 0.1, duration: 1.5, allowNestedScroll: true, prevent: inDialog }}
    >
      {children}
    </ReactLenis>
  );
}
