import home from "@/content/scraped/home.json";
import { lexicalToText, mediaUrl, payloadClient } from "@/lib/payload";
import BrandTabs from "@/ui/Home/BrandTabs";
import HeroSlider from "@/ui/Home/HeroSlider";
import ProductTabs from "@/ui/Home/ProductTabs";
import SearchBar from "@/ui/Home/SearchBar";
import { Clients, HomeFeeds, ServiceNavigator, WhyUs } from "@/ui/Home/Sections";
import Testimonials from "@/ui/Home/Testimonials";

export const revalidate = 600;

async function latestBlog() {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "blogs",
      where: { _status: { equals: "published" } },
      sort: "-publishedDate",
      limit: 1,
      depth: 1,
    });
    const b = docs[0];
    if (!b) return null;
    return {
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt || lexicalToText(b.body, 140),
      date: b.publishedDate ?? b.createdAt,
      image: mediaUrl(b.thumbnail) ?? mediaUrl(b.hero),
    };
  } catch (err) {
    console.error("[home] blogs query failed", err);
    return null;
  }
}

export default async function Home() {
  const blog = await latestBlog();

  return (
    <>
      <HeroSlider slides={home.slides} />
      <SearchBar />
      <section className="mt-12 px-4 text-center">
        <h1 className="text-2xl md:text-4xl">Delivering Exceptionally Good Customer Experience</h1>
      </section>
      <ProductTabs tabs={home.productTabs} />
      <BrandTabs tabs={home.brandTabs} />
      <ServiceNavigator intro={home.serviceNavigator.intro} items={home.serviceNavigator.items} />
      <WhyUs items={home.whyUs} />
      <Testimonials items={home.testimonials} />
      <HomeFeeds blog={blog} news={home.news} />
      <Clients logos={home.clients.filter((c): c is string => Boolean(c))} />
    </>
  );
}
