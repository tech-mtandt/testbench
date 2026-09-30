"use client";

import { Button } from "@payloadcms/ui";
import { useCallback, useEffect, useRef, useState } from "react";

type Task = { key: string; label: string };
type Status = "idle" | "running" | "done" | "error";

/**
 * Dashboard panel: copies the website's current content (bundled scraped JSON + legacy
 * images/PDFs) into the admin. Safe to re-run: existing content is kept unless
 * "Replace existing content" is ticked.
 */
export function ImportPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [log, setLog] = useState<string[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const stop = useRef(false);

  useEffect(() => {
    if (!open || tasks.length) return;
    fetch("/api/cms-import", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setTasks(j.tasks ?? []))
      .catch(() => setLog((l) => [...l, "Could not load import steps."]));
  }, [open, tasks.length]);

  const runOne = useCallback(
    async (task: Task) => {
      setStatus((s) => ({ ...s, [task.key]: "running" }));
      setLog((l) => [...l, `▶ ${task.label}`]);
      let cursor: number | null = 0;
      while (cursor !== null && !stop.current) {
        const res: Response = await fetch("/api/cms-import", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task: task.key, cursor, overwrite }),
        });
        const j = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        if (!res.ok || j.error) {
          setStatus((s) => ({ ...s, [task.key]: "error" }));
          setLog((l) => [...l, `  ✗ ${j.error ?? res.status}`]);
          return false;
        }
        setLog((l) => [...l, ...(j.log as string[]).filter((x) => x.includes("!") || x.includes("created") || x.includes("saved"))]);
        cursor = j.next;
      }
      setStatus((s) => ({ ...s, [task.key]: cursor === null ? "done" : "idle" }));
      return cursor === null;
    },
    [overwrite],
  );

  const runAll = async () => {
    setBusy(true);
    stop.current = false;
    let failed = 0;
    for (const t of tasks) {
      if (stop.current) break;
      // Keep going: a failed step is reported and can be retried by running "Import all" again.
      if (!(await runOne(t))) failed++;
    }
    setLog((l) => [...l, stop.current ? "Stopped." : failed ? `Finished with ${failed} failed step(s). Run "Import all" again to retry them.` : "Finished."]);
    setBusy(false);
  };

  const icon = (s?: Status) => (s === "done" ? "✓" : s === "running" ? "…" : s === "error" ? "✗" : "·");

  return (
    <div style={{ marginBottom: "2rem", padding: "1rem 1.25rem", border: "1px solid var(--theme-elevation-150)", borderRadius: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <strong>Import website content</strong>
          <div style={{ color: "var(--theme-elevation-500)", fontSize: 13 }}>
            Copies the pages, products and images currently on the website into the admin so they can be edited here.
          </div>
        </div>
        <Button buttonStyle="secondary" size="small" onClick={() => setOpen(!open)}>
          {open ? "Hide" : "Open"}
        </Button>
      </div>
      {open && (
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" checked={overwrite} disabled={busy} onChange={(e) => setOverwrite(e.target.checked)} />
            Replace existing content (overwrites edits made in the admin)
          </label>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0", columns: 2, fontSize: 13 }}>
            {tasks.map((t) => (
              <li key={t.key}>
                {icon(status[t.key])} {t.label}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="small" disabled={busy || !tasks.length} onClick={runAll}>
              {busy ? "Importing…" : "Import all"}
            </Button>
            {busy && (
              <Button size="small" buttonStyle="secondary" onClick={() => (stop.current = true)}>
                Stop
              </Button>
            )}
          </div>
          {log.length > 0 && (
            <pre style={{ maxHeight: 260, overflow: "auto", fontSize: 12, marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>
              {log.slice(-300).join("\n")}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
