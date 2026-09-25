import ProductPage, { productMetadata, type ProductParams } from "@/ui/CustomProduct/ProductPage";
import { customProductParams } from "@/content/custom";

export const dynamicParams = false;

export function generateStaticParams() {
  return customProductParams("rental");
}

export function generateMetadata({ params }: { params: ProductParams }) {
  return productMetadata("rental", params);
}

export default function Page({ params }: { params: ProductParams }) {
  return <ProductPage kind="rental" params={params} />;
}
