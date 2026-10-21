"use client";

import { Button } from "@payloadcms/ui";
import { useEffect, useRef, useState } from "react";

type Planned = {
  line: number;
  model: string;
  range: string | null;
  title: string;
  actions: { mode: "buy" | "rent"; action: "create" | "update"; slug: string }[];
  errors: string[];
  warnings: string[];
};
type Preview = { errors: string[]; rows: Planned[] };

const api = async (init?: RequestInit) => {
  const res = await fetch("/api/product-csv-import", { credentials: "include", ...init });
  const j = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok || j.error) throw new Error(j.error ?? `HTTP ${res.status}`);
  return j;
};

/** Excel's plain "CSV" is Windows-1252; "CSV UTF-8" is UTF-8. Read either. */
async function readText(file: File) {
  const buf = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8").decode(buf);
  return utf8.includes("�") ? new TextDecoder("windows-1252").decode(buf) : utf8;
}

const cellStyle = { padding: "4px 8px", borderBottom: "1px solid var(--theme-elevation-100)", verticalAlign: "top" } as const;

/**
 * Products list panel: import products from a CSV. Download the template, choose a file, check the
 * preview (what each row will create or update), then import. Re-importing a file updates the same
 * products (matched by model number and buy/rent); it never makes duplicates.
 */
export function ProductCsvImport() {
  const [open, setOpen] = useState(false);
  const [ranges, setRanges] = useState<string[]>([]);
  const [template, setTemplate] = useState("");
  const [range, setRange] = useState("");
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState<"" | "preview" | "import">("");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const stop = useRef(false);

  useEffect(() => {
    if (!open || ranges.length) return;
    api()
      .then((j) => {
        setRanges(j.ranges ?? []);
        setTemplate(j.template ?? "");
      })
      .catch((e) => setError(e.message));
  }, [open, ranges.length]);

  const runPreview = async (f = file, r = range) => {
    if (!f) return;
    setBusy("preview");
    setError("");
    setPreview(null);
    setLog([]);
    setDone(false);
    try {
      setPreview(await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "preview", csv: f.text, range: r || null }) }));
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy("");
  };

  const runImport = async () => {
    if (!file) return;
    setBusy("import");
    setError("");
    setLog([]);
    stop.current = false;
    let cursor: number | null = 0;
    try {
      while (cursor !== null && !stop.current) {
        const j: { next: number | null; log: string[] } = await api({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "import", csv: file.text, range: range || null, cursor }),
        });
        setLog((l) => [...l, ...j.log]);
        cursor = j.next;
      }
      setDone(cursor === null);
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy("");
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([template], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "product-import-template.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows = preview?.rows ?? [];
  const ok = rows.filter((r) => !r.errors.length);
  const count = (action: string) => ok.reduce((n, r) => n + r.actions.filter((a) => a.action === action).length, 0);

  return (
    <div style={{ margin: "0 var(--gutter-h, 60px) 1.5rem", padding: "1rem 1.25rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <strong>Import products from CSV</strong>
          <div style={{ color: "var(--theme-elevation-500)", fontSize: 13 }}>
            Add or update many products at once from a spreadsheet (in Excel: Save As → CSV UTF-8).
          </div>
        </div>
        <Button buttonStyle="secondary" size="small" onClick={() => setOpen(!open)}>
          {open ? "Hide" : "Open"}
        </Button>
      </div>

      {open && (
        <div style={{ marginTop: "1rem", fontSize: 13 }}>
          <ol style={{ margin: "0 0 1rem", paddingLeft: "1.25rem", lineHeight: 1.6 }}>
            <li>
              Start from the{" "}
              <button type="button" onClick={downloadTemplate} disabled={!template} style={{ background: "none", border: 0, padding: 0, color: "var(--theme-success-500)", textDecoration: "underline", cursor: "pointer" }}>
                template
              </button>
              : one row per model. <em>Model No</em> and <em>Range</em> are required. <em>Buy or Rent</em> is Buy, Rent or Both (empty = Both). Every
              extra column becomes a specification; the first two also show on listing cards. Rows starting with EXAMPLE are skipped.
            </li>
            <li>Choose the file and check the preview. Nothing is saved until you click Import.</li>
            <li>A model that is already on the site is updated with the columns you fill in; photos, page address and other fields stay.</li>
          </ol>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={!!busy}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const next = { name: f.name, text: await readText(f) };
                setFile(next);
                runPreview(next);
              }}
            />
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              Range for rows without one:
              <select value={range} disabled={!!busy} onChange={(e) => {
                  setRange(e.target.value);
                  runPreview(file, e.target.value);
                }}>
                <option value="">(use the Range column)</option>
                {ranges.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {busy === "preview" && <p>Checking the file…</p>}
          {error && <p style={{ color: "var(--theme-error-500)" }}>✗ {error}</p>}
          {preview?.errors.map((e) => (
            <p key={e} style={{ color: "var(--theme-error-500)" }}>
              ✗ {e}
            </p>
          ))}

          {rows.length > 0 && (
            <>
              <p style={{ margin: "1rem 0 0.5rem" }}>
                <strong>{file?.name}</strong>: {rows.length} rows. Will create <strong>{count("create")}</strong> and update <strong>{count("update")}</strong> products
                {rows.length - ok.length > 0 && (
                  <>
                    ; <strong style={{ color: "var(--theme-error-500)" }}>{rows.length - ok.length} rows skipped</strong> (see below)
                  </>
                )}
                .
              </p>
              <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid var(--theme-elevation-100)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", position: "sticky", top: 0, background: "var(--theme-elevation-50)" }}>
                      {["Line", "Model", "Range", "Title", "Buy / Rent", "Notes"].map((h) => (
                        <th key={h} style={cellStyle}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.line} style={r.errors.length ? { color: "var(--theme-error-500)" } : undefined}>
                        <td style={cellStyle}>{r.line}</td>
                        <td style={cellStyle}>{r.model || "—"}</td>
                        <td style={cellStyle}>{r.range ?? "—"}</td>
                        <td style={cellStyle}>{r.title}</td>
                        <td style={cellStyle}>{r.errors.length ? "skipped" : r.actions.map((a) => `${a.mode === "buy" ? "Buy" : "Rent"}: ${a.action === "create" ? "new" : "update"}`).join(", ")}</td>
                        <td style={cellStyle}>{[...r.errors, ...r.warnings].join("; ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "0.75rem" }}>
                <Button size="small" disabled={!!busy || !ok.length || done} onClick={runImport}>
                  {busy === "import" ? "Importing…" : done ? "Imported" : `Import ${ok.length} rows`}
                </Button>
                {busy === "import" && (
                  <Button size="small" buttonStyle="secondary" onClick={() => (stop.current = true)}>
                    Stop
                  </Button>
                )}
              </div>
            </>
          )}

          {log.length > 0 && (
            <pre style={{ maxHeight: 220, overflow: "auto", fontSize: 12, marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>
              {[...log, ...(done ? ["Done. Reload this page to see the products."] : [])].join("\n")}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
