import { permanentRedirect } from "next/navigation";

export default function Page() {
  permanentRedirect("/media?type=press");
}
