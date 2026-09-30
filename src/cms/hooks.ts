import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

import { CMS_TAG } from "./tags";

/**
 * Any admin edit expires every CMS read and every page, so changes show on the next
 * visit instead of after a deploy. Content edits are rare, so the blunt approach is fine.
 * Outside a Next request (CLI import scripts) these throw; that's expected and ignored.
 */
function bust() {
  try {
    revalidateTag(CMS_TAG, { expire: 0 });
    revalidateTag("blogs", { expire: 0 });
    revalidatePath("/", "layout");
  } catch {
    /* not running inside Next */
  }
}

const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  bust();
  return doc;
};
const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  bust();
  return doc;
};
const afterGlobalChange: GlobalAfterChangeHook = ({ doc }) => {
  bust();
  return doc;
};

export const collectionRevalidate = { afterChange: [afterChange], afterDelete: [afterDelete] };
export const globalRevalidate = { afterChange: [afterGlobalChange] };
