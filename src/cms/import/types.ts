import type { Payload, PayloadRequest } from "payload";

export type ImportContext = {
  payload: Payload;
  req?: PayloadRequest;
  /** Replace content that already exists in the CMS. Off by default so re-running an
   * import never clobbers edits made in the admin. */
  overwrite: boolean;
  /** Epoch ms; tasks stop taking new items once passed and return a cursor to resume. */
  deadline: number;
  log: (line: string) => void;
};

/**
 * One resumable import step. `run` processes items starting at `cursor` until done or
 * out of time, and returns the cursor to continue from (null when finished). Every
 * write must be idempotent: upsert by a natural key (slug, title, legacySrc).
 */
export type ImportTask = {
  key: string;
  label: string;
  run: (ctx: ImportContext, cursor: number) => Promise<number | null>;
};
