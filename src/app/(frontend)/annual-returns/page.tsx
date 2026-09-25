import { permanentRedirect } from "next/navigation";

/** Merged into the About page's investor-relations section. */
export default function Page() {
  permanentRedirect("/about-us#investors");
}
