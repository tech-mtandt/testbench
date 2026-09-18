import configPromise from "@payload-config";
import { getPayload } from "payload";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/ui/Breadcrumb";

export default async function Page() {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "services",
    depth: 1,
    limit: 0,
    sort: "createdAt",
  });

  const services = docs.map((doc) => {
    const hero = doc.hero && typeof doc.hero === "object" ? doc.hero : null;
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? null,
      imageUrl: hero?.url ?? null,
      imageAlt: hero?.alt || doc.title,
    };
  });

  return (
    <div>
      <div className="bg-[#e9e9e9] py-4">
        <div className="default-margin">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
        </div>
      </div>

      <div className="default-margin flex flex-col gap-6 py-10">
        <h5 className="font-semibold">Services</h5>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden bg-black/5"
            >
              {service.imageUrl && (
                <Image
                  src={service.imageUrl}
                  alt={service.imageAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
              <p className="absolute right-4 bottom-4 left-4 text-lg font-bold text-white transition-opacity duration-300 group-hover:opacity-0 md:text-xl">
                {service.title}
              </p>

              <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-black/80 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-lg font-bold text-white md:text-xl">{service.title}</p>
                {service.excerpt && (
                  <p className="line-clamp-3 text-sm text-white/80">{service.excerpt}</p>
                )}
                <span className="inline-flex w-fit items-center border border-primary-yellow bg-transparent px-4 py-2 text-xs font-bold text-primary-yellow uppercase">
                  Read More
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
