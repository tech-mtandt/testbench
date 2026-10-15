/**
 * Download of a file uploaded with a website lead (career CV, partner documents), linked from
 * the lead's `fields` in Supabase and from the lead email. Admin login required: the files
 * are personal documents (ID cards, CVs) and are never public.
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { getLeadFile, type Db } from "@/lib/leads";

export const dynamic = "force-dynamic";

// Always sent as an attachment; known document types keep their type, anything else is plain bytes.
const TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers }).catch(() => ({ user: null }));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
  const file = await getLeadFile((payload.db as unknown as { pool: Db }).pool, id);
  if (!file) return Response.json({ error: "Not found" }, { status: 404 });

  const ascii = file.filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType && TYPES.has(file.contentType) ? file.contentType : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Content-Length": String(file.data.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
