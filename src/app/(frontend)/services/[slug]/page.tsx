import configPromise from "@payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb, { type BreadcrumbItem } from "@/ui/Breadcrumb";
import { RichText } from "@/components/RichText";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "services",
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  });

  const service = docs[0];
  if (!service) notFound();

  const hero = service.hero && typeof service.hero === "object" ? service.hero : null;
  const poster = service.poster && typeof service.poster === "object" ? service.poster : null;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    ...(service.category ? [{ label: service.category }] : []),
    ...(service.category ? [{ label: service.title }] : []),
  ];

  return (
    <div>
      <div className="relative flex h-[340px] w-full flex-col overflow-hidden bg-black">
        {hero?.url && (
          <Image
            src={hero.url}
            alt={hero.alt || service.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/55" />

        <div className="default-margin relative z-10 pt-4">
          <Breadcrumb items={breadcrumbItems} variant="light" />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4">
          <h1 className="text-center text-3xl font-bold uppercase text-white md:text-5xl">
            {service.category || service.title}
          </h1>
        </div>
      </div>

      <div className="bg-[#f9f9f9] py-12">
        <div className="default-margin grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-bold uppercase">{service.title}</h2>
            {service.body && <RichText data={service.body} />}
          </div>

          {poster?.url && (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={poster.url}
                alt={poster.alt || service.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
