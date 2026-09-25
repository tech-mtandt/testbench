import ProductPage, { productMetadata, type ProductParams } from "@/ui/CustomProduct/ProductPage";
import { customProductParams } from "@/content/custom";

export const dynamicParams = false;

export function generateStaticParams() {
  return customProductParams("buy");
}

export function generateMetadata({ params }: { params: ProductParams }) {
  return productMetadata("buy", params);
}

export default function Page({ params }: { params: ProductParams }) {
  return <ProductPage kind="buy" params={params} />;
}
