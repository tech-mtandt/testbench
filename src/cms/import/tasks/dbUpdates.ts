import { createLocalReq } from "payload";
import type { MigrateUpArgs } from "@payloadcms/db-postgres";

import { migrations } from "../../../migrations";
import type { ImportTask } from "../types";

/**
 * Applies database migrations (src/migrations) that haven't run yet, from inside the deployed
 * app, so the database credentials never leave it. Run it after a code update that adds admin
 * fields, before using them. Each migration runs in its own transaction and is recorded in
 * payload-migrations; ours are idempotent, so running this again is harmless. Unlike
 * `payload migrate`, a failure is reported in the panel instead of exiting the process.
 */
export const dbUpdatesTask: ImportTask = {
  key: "db-updates",
  label: "Apply database updates (run after a code update that adds admin fields)",
  async run({ payload, log }) {
    const { docs } = await payload.find({ collection: "payload-migrations", limit: 0, pagination: false, depth: 0 });
    const done = new Set(docs.map((d) => d.name));
    const batch = Math.max(0, ...docs.map((d) => Number(d.batch) || 0)) + 1;
    const pending = migrations.filter((m) => !done.has(m.name));
    log(`Already applied: ${[...done].sort().join(", ") || "none"}`);
    if (!pending.length) {
      log("The database is up to date.");
      return null;
    }
    for (const m of pending) {
      const started = Date.now();
      const req = await createLocalReq({}, payload);
      const drizzle = (payload.db as unknown as { drizzle: { transaction: (fn: (tx: unknown) => Promise<void>) => Promise<void> } }).drizzle;
      try {
        await drizzle.transaction((tx) => m.up({ db: tx, payload, req } as unknown as MigrateUpArgs));
      } catch (err) {
        log(`! ${m.name} failed, nothing from it was applied: ${(err as Error).message.split("\n")[0]}`);
        throw new Error(`Database update ${m.name} failed; see the log above.`);
      }
      await payload.create({ collection: "payload-migrations", data: { name: m.name, batch } });
      log(`  applied ${m.name} (${Date.now() - started} ms)`);
    }
    log("Done.");
    return null;
  },
};
