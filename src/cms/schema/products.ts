import { CustomProducts } from "../../collections/CustomProducts";
import { ProductAttributes } from "../../collections/ProductAttributes";
import { ProductCategories } from "../../collections/ProductCategories";
import { ProductListings } from "../../collections/ProductListings";
import type { Area } from "./types";

// `products` itself is registered directly in payload.config (it predates the areas).
export const productsArea: Area = {
  collections: [ProductCategories, ProductListings, ProductAttributes, CustomProducts],
  globals: [],
  seo: {
    collections: ["products", "product-categories", "product-listings", "custom-products"],
    globals: [],
    url: ({ collectionSlug, doc }) => {
      if (!doc) return undefined;
      switch (collectionSlug) {
        case "products":
          return `/product-detail/${doc.slug ?? ""}`;
        case "product-categories":
          return `/category-by-subcategory/${doc.slug ?? ""}`;
        case "product-listings":
          return doc.path || undefined;
        case "custom-products":
          return `/custom-product-detail-${doc.kind ?? "buy"}/${doc.category ?? ""}/${doc.slug ?? ""}`;
      }
      return undefined;
    },
  },
};
