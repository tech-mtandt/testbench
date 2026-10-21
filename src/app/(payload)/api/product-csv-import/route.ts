/**
 * Product CSV import (admin > Products > "Import products from CSV"). The panel sends the file's
 * text: "preview" says what each row would do; "import" does it a slice at a time and returns a
 * cursor, which the panel sends back until the import is done.
 */
import config from "@payload-config";
import { createLocalReq, getPayload } from "payload";
import { isEditor } from "@/access/roles";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Editors and administrators: the people who can edit products in the admin. */
async function authed(req: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return null;
  const local = await createLocalReq({ user }, payload);
  return (await isEditor(local)) ? { payload, local } : null;
}

export async function GET(req: Request) {
  const auth = await authed(req);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { listRanges } = await import("@/cms/import/productCsvRun");
  const { TEMPLATE_CSV } = await import("@/cms/import/productCsv");
  return Response.json({ ranges: await listRanges(auth.payload, auth.local), template: TEMPLATE_CSV });
}

export async function POST(req: Request) {
  const auth = await authed(req);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; csv?: string; range?: string | null; cursor?: number };
  if (typeof body.csv !== "string" || !body.csv.trim()) return Response.json({ error: "The file is empty." }, { status: 400 });
  const { previewCsv, importCsv } = await import("@/cms/import/productCsvRun");
  try {
    if (body.action === "preview") return Response.json(await previewCsv(auth.payload, body.csv, body.range ?? null, auth.local));
    if (body.action === "import")
      return Response.json(await importCsv(auth.payload, body.csv, body.range ?? null, Number(body.cursor) || 0, Date.now() + 45_000, auth.local));
    return Response.json({ error: 'action must be "preview" or "import"' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
