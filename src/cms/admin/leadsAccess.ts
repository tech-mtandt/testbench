import { createLocalReq, type Payload } from "payload";
import { isEditor } from "@/access/roles";
import type { Db } from "@/lib/leads";

/**
 * Website leads hold personal details (and CVs, ID documents), so only editors and administrators
 * see them: the same rule as the lead file downloads.
 */
export async function canViewLeads(payload: Payload, user: unknown): Promise<boolean> {
  if (!user) return false;
  return isEditor(await createLocalReq({ user: user as never }, payload));
}

/** The pg Pool behind Payload's Postgres adapter. */
export const leadsPool = (payload: Payload) => (payload.db as unknown as { pool: Db }).pool;
