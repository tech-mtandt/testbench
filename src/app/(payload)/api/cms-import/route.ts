/**
 * Content import endpoint used by the dashboard's "Import website content" panel.
 * Runs inside the deployed app so the database and storage credentials never leave it.
 * Each call does a slice of one task and returns a cursor; the panel keeps calling.
 */
import config from "@payload-config";
import { getPayload } from "payload";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function authed(req: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  return user ? payload : null;
}

export async function GET(req: Request) {
  if (!(await authed(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { listTasks } = await import("@/cms/import/run");
  return Response.json({ tasks: listTasks() });
}

export async function POST(req: Request) {
  const payload = await authed(req);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { task?: string; cursor?: number; overwrite?: boolean };
  if (!body.task) return Response.json({ error: "task is required" }, { status: 400 });
  const { runTask } = await import("@/cms/import/run");
  try {
    const result = await runTask(payload, body.task, Number(body.cursor) || 0, Boolean(body.overwrite), 45_000);
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
