import { MEDIA_BANNER } from "@/content/media";

/** Dark illustrated "MEDIA" banner shared by the four media listings. */
export default function MediaBanner({ title = "Media" }: { title?: string }) {
  return (
    <section
      className="relative flex h-32 items-center justify-center bg-black bg-cover bg-center lg:bg-left sm:h-44 lg:h-[236px]"
      style={{ backgroundImage: `url("${MEDIA_BANNER}")` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <h1 className="relative z-10 -mt-4 text-2xl font-bold uppercase text-white md:text-[1.9rem]">{title}</h1>
    </section>
  );
}
