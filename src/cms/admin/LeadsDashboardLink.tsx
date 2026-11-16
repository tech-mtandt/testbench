import Link from "next/link";
import type { ServerProps } from "payload";
import { LEAD_FORMS } from "@/lib/lead-forms";
import { istDay, listLeads } from "@/lib/leads";
import { canViewLeads, leadsPool } from "./leadsAccess";

/** Dashboard card linking to the Leads page, with this week's count; editors and administrators only. */
export async function LeadsDashboardLink({ payload, user }: ServerProps) {
  if (!(await canViewLeads(payload, user))) return null;
  const { total } = await listLeads(leadsPool(payload), { show: "leads", from: istDay(6), to: null, q: null }, LEAD_FORMS, { limit: 1 }).catch(
    () => ({ total: null }),
  );
  return (
    <Link
      href="/admin/leads"
      prefetch={false}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "16px",
        marginBottom: 24,
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "var(--style-radius-m, 6px)",
        color: "var(--theme-text)",
        textDecoration: "none",
      }}
    >
      <span>
        <strong style={{ display: "block" }}>Leads</strong>
        <span style={{ color: "var(--theme-elevation-500)" }}>
          Enquiries and other forms submitted on the website. View, search and export to Excel.
        </span>
      </span>
      {total !== null && (
        <span style={{ whiteSpace: "nowrap" }}>
          <strong>{total}</strong> in the last 7 days →
        </span>
      )}
    </Link>
  );
}
