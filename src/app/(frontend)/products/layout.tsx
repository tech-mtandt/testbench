import CompareTray from "@/ui/Catalog/CompareTray";

/** Shared by catalog, category, detail and compare pages: the floating compare tray. */
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CompareTray />
    </>
  );
}
