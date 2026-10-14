import type { Metadata } from "next";
import { getInvestorRelations } from "@/content/investor-relations";
import { PageBanner } from "@/ui/PageChrome";
import ReturnTabs from "./ReturnTabs";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getInvestorRelations();
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description || undefined,
    alternates: { canonical: "/investor-relations" },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}

export default async function Page() {
  const data = await getInvestorRelations();
  return (
    <>
      <PageBanner title="Investor Relations" image={data.banner} crumbs={[{ label: "Investor Relations" }]} />
      <section className="bg-white py-12">
        <div className="default-margin">
          <ReturnTabs tabs={data.tabs} />
        </div>
      </section>
    </>
  );
}
