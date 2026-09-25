import { permanentRedirect } from "next/navigation";

/** Merged into the single partner programs page. */
export default function Page() {
  permanentRedirect("/partners?type=customer");
}
