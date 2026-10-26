"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const noSubscription = () => () => {};
/** The admin window this preview runs in (Live Preview iframe or its pop-out), if any. */
const adminWindow = () => window.opener ?? (window.parent !== window ? window.parent : null);

/**
 * Rendered only in draft mode (an editor previewing unpublished changes, see /api/preview).
 * Inside the admin's Live Preview (an iframe, or its pop-out window) it tells the admin the page
 * is ready and re-renders the page each time the editor saves or autosaves. Opened on its own,
 * it shows a bar to leave preview mode, so drafts aren't mistaken for the live site.
 */
export default function PreviewMode() {
  const router = useRouter();
  const pathname = usePathname();
  // On the server (and while hydrating) assume the admin's panel: no bar until the browser knows.
  const embedded = useSyncExternalStore(noSubscription, () => Boolean(adminWindow()), () => true);

  useEffect(() => {
    const admin = adminWindow();
    if (!admin) return;
    const origin = window.location.origin;
    admin.postMessage({ type: "payload-live-preview", ready: true }, origin);
    const onMessage = (e: MessageEvent) => {
      if (e.origin === origin && e.data?.type === "payload-document-event") router.refresh();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  if (embedded) return null;
  return (
    <div
      role="status"
      className="fixed z-[100] flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg"
      style={{ left: "max(16px, env(safe-area-inset-left, 0px))", bottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
    >
      <span>Preview: unpublished changes are showing</span>
      <a href={`/api/exit-preview?path=${encodeURIComponent(pathname)}`} className="font-semibold text-brand underline underline-offset-2">
        Leave preview
      </a>
    </div>
  );
}
