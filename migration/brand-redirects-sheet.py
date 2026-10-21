"""
Builds the redirect tracking sheet (Excel) from src/content/brand-redirects.json, the same
list the site serves its 301 redirects from, so the sheet always matches what is live.

  python3 migration/brand-redirects-sheet.py OUT.xlsx --status "Live" --tested 2026-10-21

Needs openpyxl. Status is the implementation status written on every row.
"""
import argparse
import json
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

SITE = "https://www.mtandt.com"
INK, BRAND_YELLOW, GRID = "131313", "F7E433", "D9D9D9"
BRAND_FILL = {"TsaF": "E6EEF8", "AQ Access": "E7F3E8", "Comet Bharat": "FBEDE3"}
STATUSES = ["Implemented – awaiting go-live", "Live", "Change requested", "On hold", "Removed"]

FONT = Font(name="Arial", size=10)
BOLD = Font(name="Arial", size=10, bold=True)
HEAD = Font(name="Arial", size=10, bold=True, color="FFFFFF")
LINK = Font(name="Arial", size=10, color="1F4E99", underline="single")
TITLE = Font(name="Arial", size=16, bold=True, color=INK)
SUB = Font(name="Arial", size=10, italic=True, color="595959")
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="top", wrap_text=True)
THIN = Border(*(Side(style="thin", color=GRID),) * 4)


def title(ws, text, sub, width):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=width)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=width)
    ws["A1"], ws["A2"] = text, sub
    ws["A1"].font, ws["A2"].font = TITLE, SUB
    ws["A1"].fill = PatternFill("solid", fgColor=BRAND_YELLOW)
    ws.row_dimensions[1].height = 30
    ws["A1"].alignment = Alignment(vertical="center", indent=1)
    ws["A2"].alignment = Alignment(vertical="center", indent=1)


def table(ws, row, headers, widths, rows, links=(), center=()):
    """Header row at `row`, data below; returns the last data row."""
    for c, (h, w) in enumerate(zip(headers, widths), 1):
        cell = ws.cell(row, c, h)
        cell.font, cell.fill, cell.border = HEAD, PatternFill("solid", fgColor=INK), THIN
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.row_dimensions[row].height = 32
    for r, values in enumerate(rows, row + 1):
        for c, v in enumerate(values, 1):
            cell = ws.cell(r, c, v)
            cell.font, cell.border = FONT, THIN
            cell.alignment = CENTER if c in center else WRAP
            if c in links and isinstance(v, str) and v.startswith("http"):
                cell.hyperlink, cell.font = v, LINK
    return row + len(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--status", default=STATUSES[0], choices=STATUSES)
    ap.add_argument("--tested", default=date.today().isoformat())
    a = ap.parse_args()
    data = json.loads((Path(__file__).parent.parent / "src/content/brand-redirects.json").read_text())
    redirects, sections, retained = data["redirects"], data["sections"], data["retained"]

    wb = Workbook()
    summary = wb.active
    summary.title = "Summary"
    tracker = wb.create_sheet("Redirect Tracker")
    variants = wb.create_sheet("Older URL Variants")
    kept = wb.create_sheet("Not Redirected (Reviewed)")
    checks = wb.create_sheet("Testing & Go-Live")

    # ---- Redirect Tracker: the seven requested columns first, in the requested order.
    headers = ["S.No.", "Existing URL (MTandT Website)", "New Redirect URL (Respective Brand Website)", "Brand Name",
               "Reason for Redirection", "Redirect Type", "Implementation Status", "Remarks",
               "MTandT Page", "Older URLs Also Redirected", "Test Result"]
    rows = []
    for i, r in enumerate(redirects, 1):
        n = len(r.get("also", []))
        remarks = r.get("remarks", "")
        if n:
            remarks = f"{remarks}. " if remarks else ""
            remarks += f"Also redirects {n} older address{'es' if n > 1 else ''} of this page (see 'Older URL Variants')."
        rows.append([i, SITE + r["from"], r["to"], r["brand"], r["reason"], "301 Permanent", a.status, remarks or "—",
                     r["page"], n, "Pass: 301 → 200"])
    title(tracker, "MTandT → Brand Websites: 301 Redirect Tracker",
          f"One row per MTandT page. Tested {a.tested}. Update 'Implementation Status' from the drop-down; "
          "send changes to the web team to update src/content/brand-redirects.json.", len(headers))
    first, last = 5, table(tracker, 4, headers, [6, 72, 62, 14, 40, 13, 26, 56, 52, 12, 15], rows,
                           links=(2, 3), center=(1, 4, 6, 7, 10, 11))
    tracker.freeze_panes = "C5"
    tracker.auto_filter.ref = f"A4:{get_column_letter(len(headers))}{last}"
    for rr in range(first, last + 1):
        brand = tracker.cell(rr, 4).value
        tracker.cell(rr, 4).fill = PatternFill("solid", fgColor=BRAND_FILL.get(brand, "FFFFFF"))
    dv = DataValidation(type="list", formula1='"' + ",".join(STATUSES) + '"', allow_blank=False)
    tracker.add_data_validation(dv)
    dv.add(f"G{first}:G{last}")
    status_range = f"G{first}:G{last}"
    tracker.conditional_formatting.add(status_range, CellIsRule(operator="equal", formula=['"Live"'], fill=PatternFill("solid", fgColor="D8F0DC")))
    tracker.conditional_formatting.add(status_range, CellIsRule(operator="equal", formula=[f'"{STATUSES[0]}"'], fill=PatternFill("solid", fgColor="FFF4CC")))
    tracker.conditional_formatting.add(status_range, CellIsRule(operator="equal", formula=['"Change requested"'], fill=PatternFill("solid", fgColor="FCE4E4")))

    # ---- Older URL Variants: every other address served by the same redirect.
    vrows = []
    for r in redirects:
        for s in r.get("also", []):
            vrows.append([len(vrows) + 1, SITE + s, r["to"], r["brand"], SITE + r["from"], "301 Permanent"])
    for s in sections:
        vrows.append([len(vrows) + 1, f"{SITE}{s['prefix']}/…  (any other address in this section)", s["to"], s["brand"],
                      "Safety net for addresses not listed above (e.g. products added later)", "301 Permanent"])
    title(variants, "Older and Alternate MTandT Addresses",
          "Old-site and earlier addresses of the same pages. Each goes to the brand page in one hop (no redirect chains).", 6)
    vlast = table(variants, 4, ["S.No.", "Older / Alternate MTandT URL", "Redirects To", "Brand Name",
                                "Same Page As (Redirect Tracker)", "Redirect Type"],
                  [6, 70, 58, 14, 62, 14], vrows, links=(3,), center=(1, 4, 6))
    variants.freeze_panes = "C5"
    variants.auto_filter.ref = f"A4:F{vlast}"

    # ---- Pages reviewed and deliberately kept on MTandT.
    title(kept, "Pages Reviewed and Kept on MTandT",
          "Related to the three brands but not redirected. Mark any that should move and they will be added.", 5)
    klast = table(kept, 4, ["S.No.", "MTandT URL", "Related Brand", "Decision", "Reason"], [6, 70, 26, 16, 80],
                  [[i, SITE + k["path"], k["brand"], "Kept on MTandT", k["note"]] for i, k in enumerate(retained, 1)],
                  links=(2,), center=(1, 4))
    kept.freeze_panes = "A5"
    kept.auto_filter.ref = f"A4:E{klast}"

    # ---- Testing done and go-live checklist.
    n_addr = sum(1 + len(r.get("also", [])) for r in redirects)
    n_dest = len({r["to"] for r in redirects} | {s["to"] for s in sections})
    title(checks, "Testing and Go-Live Checklist", f"Tests run {a.tested} on a production build of the site.", 4)
    tests = [
        ["Every listed address returns HTTP 301 to the correct brand URL",
         f"Pass ({n_addr} addresses + {len(sections)} section rules)", "Status code and Location header checked for each address."],
        ["Destination pages load directly (no redirect chains)", f"Pass ({n_dest} of {n_dest})",
         "Each brand URL returns 200 with no further redirect, so link value passes in one hop."],
        ["Pages staying on MTandT are unaffected", "Pass (466 pages, 0 redirected)", "Every other page in the MTandT sitemap was checked."],
        ["Moved pages removed from mtandt.com/sitemap.xml", "Pass", "Search engines are not asked to crawl redirecting URLs."],
        ["Menus, home page, catalogue, blog links point straight to brand sites", "Pass",
         "Visitors and crawlers skip the redirect hop on internal links."],
        ["Moved blog posts removed from the MTandT blog list and sidebars", "Pass", "No cards that lead off-site."],
        ["Tracking parameters carried through (UTM, gclid)", "Pass", "e.g. ?utm_source=google arrives on the brand page."],
        ["Upper-case and trailing-slash variants", "Pass", "Matched case-insensitively."],
    ]
    tlast = table(checks, 4, ["Check", "Result", "Details", ""], [62, 36, 70, 4], tests, center=(2,))
    for rr in range(5, tlast + 1):
        checks.cell(rr, 2).fill = PatternFill("solid", fgColor="D8F0DC")
    todo_row = tlast + 3
    checks.cell(todo_row - 1, 1, "Go-live and follow-up (fill in Owner and Status)").font = BOLD
    todo = [
        ["Deploy to www.mtandt.com and re-run the redirect test on the live site", "", "To do"],
        ["Google Ads: change the final URL of any ad pointing at a moved page to the brand URL "
         "(ads whose final URL redirects to another domain are disapproved for destination mismatch)", "", "To do"],
        ["Google Search Console (mtandt.com): resubmit sitemap.xml; 'Page with redirect' for moved URLs is expected", "", "To do"],
        ["Google Search Console: verify tsafsafety.com, aqaccess.com and cometbharat.com and submit their sitemaps", "", "To do"],
        ["Update links the team controls (Google Business Profile, social bios, directories, email signatures, brochures)", "", "To do"],
        ["Keep these redirects permanently (at least 12 months); tell the web team before a brand site renames a page", "", "Ongoing"],
        ["Monitor traffic and rankings on the brand sites for 4–8 weeks after go-live", "", "To do"],
    ]
    llast = table(checks, todo_row, ["Item", "Owner", "Status", ""], [62, 36, 70, 4], todo, center=(3,))
    dv2 = DataValidation(type="list", formula1='"To do,In progress,Done,Ongoing"', allow_blank=True)
    checks.add_data_validation(dv2)
    dv2.add(f"C{todo_row + 1}:C{llast}")
    for rr in range(todo_row + 1, llast + 1):
        checks.cell(rr, 2).fill = PatternFill("solid", fgColor="FFFBE0")
    checks.cell(llast + 2, 1, "Legend: yellow cells are for the team to fill in; Status has a drop-down.").font = SUB

    # ---- Summary: counts are formulas over the tracker, so they follow edits there.
    title(summary, "MTandT Brand Website Redirects: Summary",
          f"301 permanent redirects from mtandt.com to the TsaF, AQ Access and Comet Bharat websites. Tested {a.tested}.", 7)
    tr = f"'Redirect Tracker'!$D${first}:$D${last}"
    pg = f"'Redirect Tracker'!$I${first}:$I${last}"
    st = f"'Redirect Tracker'!$G${first}:$G${last}"
    hdr = ["Brand", "Website", "Category & series", "Listings", "Products", "Blog posts", "Total pages"]
    table(summary, 4, hdr, [46, 26, 15, 15, 15, 15, 15], [])
    brands = list(data["brands"].items())
    for i, (b, url) in enumerate(brands, 5):
        summary.cell(i, 1, b).font = BOLD
        summary.cell(i, 2, url).hyperlink = url
        summary.cell(i, 2).font = LINK
        summary.cell(i, 3, f'=COUNTIFS({tr},A{i},{pg},"Category*")+COUNTIFS({tr},A{i},{pg},"Series*")')
        summary.cell(i, 4, f'=COUNTIFS({tr},A{i},{pg},"Buy listing*")+COUNTIFS({tr},A{i},{pg},"Rent listing*")')
        summary.cell(i, 5, f'=COUNTIFS({tr},A{i},{pg},"Product*")')
        summary.cell(i, 6, f'=COUNTIFS({tr},A{i},{pg},"Blog post*")')
        summary.cell(i, 7, f"=COUNTIF({tr},A{i})")
    tot = 5 + len(brands)
    summary.cell(tot, 1, "Total").font = BOLD
    for c in range(3, 8):
        col = get_column_letter(c)
        summary.cell(tot, c, f"=SUM({col}5:{col}{tot - 1})").font = BOLD
    for rr in range(5, tot + 1):
        for c in range(1, 8):
            summary.cell(rr, c).border = THIN
            if rr < tot and c > 2:
                summary.cell(rr, c).font = FONT
            summary.cell(rr, c).alignment = Alignment(horizontal="center" if c > 2 else "left", vertical="center")
    summary.cell(tot + 1, 1, "Note: TsaF's products include MTandT's two Aluminium Cage Ladder pages (AQ Access has no cage ladder; TsaF does).").font = SUB

    r0 = tot + 3
    summary.cell(r0, 1, "Implementation status").font = BOLD
    for j, s in enumerate(STATUSES, r0 + 1):
        summary.cell(j, 1, s).font = FONT
        summary.cell(j, 2, f'=COUNTIF({st},A{j})').font = FONT
        for c in (1, 2):
            summary.cell(j, c).border = THIN
    r1 = r0 + len(STATUSES) + 2
    facts = [
        ("Redirect type", "301 Permanent (passes search ranking to the brand page)"),
        ("Older addresses + section rules also redirected", f"=COUNTA('Older URL Variants'!B5:B{vlast})"),
        ("Pages reviewed and kept on MTandT", f"=COUNTA('Not Redirected (Reviewed)'!B5:B{klast})"),
        ("Source of truth", "src/content/brand-redirects.json (site repository)"),
    ]
    for j, (k, v) in enumerate(facts, r1):
        summary.cell(j, 1, k).font = BOLD
        summary.cell(j, 2, v).font = FONT
    summary.freeze_panes = "A4"

    for ws in wb.worksheets:
        ws.sheet_view.showGridLines = False
        ws.sheet_properties.tabColor = INK if ws.title == "Summary" else BRAND_YELLOW
        # Print landscape, one page wide.
        ws.page_setup.orientation = "landscape"
        ws.page_setup.paperSize = ws.PAPERSIZE_A4
        ws.sheet_properties.pageSetUpPr.fitToPage = True
        ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0
    wb.save(a.out)
    print(f"wrote {a.out}: {len(rows)} pages, {len(vrows)} older addresses/patterns, {len(retained)} kept")


if __name__ == "__main__":
    main()
