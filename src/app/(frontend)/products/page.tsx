import type { Metadata } from "next";
import { catalog, catalogCategories } from "@/content/catalog";
import { catalogView, parseFilters, type SearchParams } from "@/content/catalog-view";
import PageHero from "@/ui/kit/PageHero";
import CatalogBrowser from "@/ui/Catalog/CatalogBrowser";
import HelpCard from "@/ui/Catalog/HelpCard";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: "Equipment catalog — buy or rent",
    description:
      "Aerial work platforms, material handling equipment, aluminium scaffolding, light towers, road mats, fall protection and tools — to buy or rent from Mtandt.",
    alternates: { canonical: "/products" },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ searchParams }: Props) {
  const view = catalogView(parseFilters(await searchParams));
  const rentable = catalog.filter((i) => i.modes.includes("rent")).length;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Equipment" }]}
        eyebrow="Equipment catalog"
        title={
          <>
            Every machine.
            <br className="hidden sm:block" /> One catalog.
          </>
        }
        description="Search by model or spec, filter by working height, power and brand — then buy, rent, or compare up to four side by side."
        aside={
          <HelpCard
            source="catalog"
            stats={[
              { value: String(catalog.length), label: "Machines & systems" },
              { value: String(catalogCategories.length), label: "Equipment families" },
              { value: String(rentable), label: "Available to rent" },
              { value: "1 day", label: "Quote response time" },
            ]}
          />
        }
      />
      <section className="pb-24">
        <CatalogBrowser view={view} scope="all" resetHref="/products" />
      </section>
    </>
  );
}
