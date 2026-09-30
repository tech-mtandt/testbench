import type { Metadata } from "next";
import { getAnnualReturns } from "@/content/annual-returns";
import ReturnTabs from "./ReturnTabs";
import { bgUrl } from "@/lib/img";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getAnnualReturns();
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description || undefined,
    alternates: { canonical: "/annual-returns" },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}

export default async function Page() {
  const data = await getAnnualReturns();
  return (
    <>
      <section
        className="h-28 bg-[#e9ecef] bg-cover bg-center sm:h-40 md:h-[190px]"
        style={data.banner ? { backgroundImage: `url("${bgUrl(data.banner)}")` } : undefined}
      >
        <h1 className="sr-only">Annual Returns</h1>
      </section>
      <section className="bg-white py-12">
        <div className="default-margin">
          <ReturnTabs tabs={data.tabs} />
        </div>
      </section>
    </>
  );
}
