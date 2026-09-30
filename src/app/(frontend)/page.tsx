import type { Metadata } from "next";
import { getHome } from "@/content/home";
import { getSite } from "@/content/site";
import { lexicalToText, mediaUrl, payloadClient } from "@/lib/payload";
import BrandTabs from "@/ui/Home/BrandTabs";
import HeroSlider from "@/ui/Home/HeroSlider";
import ProductTabs from "@/ui/Home/ProductTabs";
import SearchBar from "@/ui/Home/SearchBar";
import { Clients, HomeFeeds, ServiceNavigator, WhyUs } from "@/ui/Home/Sections";
import Testimonials from "@/ui/Home/Testimonials";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  // Admin SEO tab (Pages > Homepage > SEO); when empty the layout defaults apply as before.
  const seo = (await getHome()).seo;
  if (!seo) return {};
  return {
    ...(seo.title ? { title: { absolute: seo.title } } : {}),
    ...(seo.description ? { description: seo.description } : {}),
    ...(seo.image ? { openGraph: { images: [seo.image] } } : {}),
  };
}

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
  const [home, site, blog] = await Promise.all([getHome(), getSite(), latestBlog()]);
  const h = home.headings;

  return (
    <>
      <HeroSlider slides={home.slides} button={{ label: h.heroButtonLabel, href: h.heroButtonHref }} />
      <SearchBar />
      <section className="mt-12 px-4 text-center">
        <h1 className="text-2xl md:text-4xl">{h.heading}</h1>
      </section>
      <ProductTabs tabs={home.productTabs} heading={h.productsHeading} />
      <BrandTabs tabs={home.brandTabs} heading={h.brandsHeading} tagline={h.brandsTagline} />
      <ServiceNavigator
        intro={home.serviceNavigator.intro}
        items={home.serviceNavigator.items}
        heading={h.serviceNavigatorHeading}
        linkLabel={h.serviceNavigatorLinkLabel}
      />
      <WhyUs items={home.whyUs} heading={h.whyUsHeading} />
      <Testimonials items={home.testimonials} heading={h.testimonialsHeading} />
      <HomeFeeds blog={blog} news={home.news} socials={site.socials} headings={h} />
      <Clients logos={home.clients} heading={h.clientsHeading} />
    </>
  );
}
