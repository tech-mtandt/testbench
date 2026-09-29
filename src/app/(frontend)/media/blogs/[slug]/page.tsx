import configPromise from "@payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb, { type BreadcrumbItem } from "@/ui/Breadcrumb";
import { RichText } from "@/components/RichText";

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "blogs",
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  });

  const blog = docs[0];
  if (!blog) notFound();

  const hero = blog.hero && typeof blog.hero === "object" ? blog.hero : null;
  const thumbnail = blog.thumbnail && typeof blog.thumbnail === "object" ? blog.thumbnail : null;
  const heroImage = hero ?? thumbnail;

  const { docs: latestDocs } = await payload.find({
    collection: "blogs",
    depth: 1,
    limit: 7,
    sort: "-publishedDate",
    where: { id: { not_equals: blog.id } },
  });

  const latestBlogs = latestDocs.map((doc) => {
    const docHero = doc.hero && typeof doc.hero === "object" ? doc.hero : null;
    const docThumbnail = doc.thumbnail && typeof doc.thumbnail === "object" ? doc.thumbnail : null;
    const image = docHero ?? docThumbnail;
    return {
      id: doc.id,
      title: doc.title,
      href: `/media/blogs/${doc.slug}`,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt || doc.title,
      date: formatDate(doc.publishedDate),
    };
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Media", href: "/media" },
    { label: "Blogs", href: "/media" },
    { label: blog.title },
  ];

  const publishedDate = formatDate(blog.publishedDate);

  return (
    <div className="default-margin flex flex-col gap-6 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {publishedDate && <p className="text-sm text-black/60">{publishedDate}</p>}
          <h1 className="text-3xl font-bold md:text-4xl">{blog.title}</h1>

          {heroImage?.url && (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/5">
              <Image
                src={heroImage.url}
                alt={heroImage.alt || blog.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 66vw, 100vw"
                priority
              />
            </div>
          )}

          {blog.body && (
            <RichText
              data={blog.body}
              className="flex flex-col gap-4 [&_h2]:mt-4 [&_h3]:mt-4 [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
            />
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <h3 className="text-xl font-bold">Latest Blogs</h3>
          <div className="flex flex-col gap-5">
            {latestBlogs.map((item) => (
              <Link key={item.id} href={item.href} className="group flex gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-black/5">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="112px"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold group-hover:underline">{item.title}</p>
                  {item.date && <p className="text-xs text-black/60">{item.date}</p>}
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
