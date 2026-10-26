/** Leaves preview mode (see /api/preview): the page shows the published site again. */
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { ownPath } from "@/cms/preview";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  (await draftMode()).disable();
  redirect(ownPath(req, new URL(req.url).searchParams.get("path")) ?? "/");
}
