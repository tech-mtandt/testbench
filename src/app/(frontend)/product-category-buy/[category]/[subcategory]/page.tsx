import { listingParams } from "@/content/products";
import ListingPage, { listingMetadata, type ListingParams } from "@/ui/Products/ListingPage";

export function generateStaticParams() {
  return listingParams();
}

export const generateMetadata = (p: ListingParams) => listingMetadata("buy", p);

export default function Page(p: ListingParams) {
  return <ListingPage mode="buy" {...p} />;
}
