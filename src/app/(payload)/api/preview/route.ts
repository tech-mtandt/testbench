/**
 * Preview for the admin's Live Preview panel and Preview button: turns on Next draft mode (a
 * cookie in the editor's browser only), so pages show the latest unpublished drafts, then opens
 * the page. Editors only; /api/exit-preview turns it off again.
 */
import config from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { createLocalReq, getPayload } from "payload";
import { isEditor } from "@/access/roles";
import { ownPath } from "@/cms/preview";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const path = ownPath(req, new URL(req.url).searchParams.get("path"));
  if (!path) return new Response("Unknown page.", { status: 400 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user || !(await isEditor(await createLocalReq({ user }, payload)))) {
    return new Response("Sign in to the admin to preview unpublished changes.", { status: 401 });
  }
  (await draftMode()).enable();
  redirect(path);
}
