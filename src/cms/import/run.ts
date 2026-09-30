import type { Payload } from "payload";

import { tasks } from "./registry";
import type { ImportTask } from "./types";

export const listTasks = () => tasks.map(({ key, label }) => ({ key, label }));

/** Run one task from `cursor` within `budgetMs`; returns where to resume (null = done). */
export async function runTask(
  payload: Payload,
  key: string,
  cursor: number,
  overwrite: boolean,
  budgetMs: number,
): Promise<{ next: number | null; log: string[] }> {
  const task: ImportTask | undefined = tasks.find((t) => t.key === key);
  if (!task) throw new Error(`Unknown import task "${key}"`);
  const log: string[] = [];
  const next = await task.run(
    { payload, overwrite, deadline: Date.now() + budgetMs, log: (l) => log.push(l) },
    cursor,
  );
  return { next, log };
}
