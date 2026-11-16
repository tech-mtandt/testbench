import Link from "next/link";
import type { ServerProps } from "payload";
import { canViewLeads } from "./leadsAccess";

/** "Leads" in the admin sidebar, after the collections; shown to editors and administrators only. */
export async function LeadsNavLink({ payload, user }: ServerProps) {
  if (!(await canViewLeads(payload, user))) return null;
  return (
    <Link className="nav__link" href="/admin/leads" id="nav-leads" prefetch={false}>
      <span className="nav__link-label">Leads</span>
    </Link>
  );
}
