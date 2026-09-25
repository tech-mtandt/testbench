import type { Metadata } from "next";
import data from "@/content/scraped/annual-returns.json";
import ReturnTabs from "./ReturnTabs";

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/annual-returns" },
};

export default function Page() {
  return (
    <>
      <section
        className="h-28 bg-[#e9ecef] bg-cover bg-center sm:h-40 md:h-[190px]"
        style={data.banner ? { backgroundImage: `url("${data.banner}")` } : undefined}
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
