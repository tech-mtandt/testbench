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

/**
 * Saving a draft (Save Draft, or autosave every few seconds while editing) only stores a
 * version; the published content the site shows is unchanged, so the cache stays. Publishing,
 * unpublishing and ordinary saves refresh the site.
 */
const isDraftSave = (req: { query?: Record<string, unknown> }) => req.query?.draft === "true" || req.query?.draft === true;

const afterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!isDraftSave(req)) bust();
  return doc;
};
const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  bust();
  return doc;
};
const afterGlobalChange: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!isDraftSave(req)) bust();
  return doc;
};

export const collectionRevalidate = { afterChange: [afterChange], afterDelete: [afterDelete] };
export const globalRevalidate = { afterChange: [afterGlobalChange] };
