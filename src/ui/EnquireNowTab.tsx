import Link from "next/link";

export default function EnquireNowTab() {
  return (
    <Link
      href="/contact"
      className="fixed top-1/2 right-0 z-40 -translate-y-1/2 bg-primary-yellow px-2 py-4 text-xs font-bold tracking-wide text-black uppercase [writing-mode:vertical-rl]"
    >
      Enquire Now
    </Link>
  );
}
