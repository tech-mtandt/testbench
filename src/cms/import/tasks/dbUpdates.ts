import { createLocalReq } from "payload";
import { sql, type MigrateUpArgs } from "@payloadcms/db-postgres";

import { migrations } from "../../../migrations";
import type { ImportTask } from "../types";

type Drizzle = {
  transaction: (fn: (tx: unknown) => Promise<void>) => Promise<void>;
  execute: (query: unknown) => Promise<unknown>;
};

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
    const lines: string[] = [];
    const say = (l: string) => {
      lines.push(l);
      log(l);
    };
    // The panel only shows an error's message, so a failure carries the log with it.
    const fail = (msg: string): never => {
      throw new Error([...lines, msg].join("\n"));
    };
    const drizzle = (payload.db as unknown as { drizzle: Drizzle }).drizzle;

    const { docs } = await payload.find({ collection: "payload-migrations", limit: 0, pagination: false, depth: 0 });
    const done = new Set(docs.map((d) => d.name));
    const batch = Math.max(0, ...docs.map((d) => Number(d.batch) || 0)) + 1;
    const pending = migrations.filter((m) => !done.has(m.name));
    say(`Already applied: ${[...done].sort().join(", ") || "none"}`);
    if (!pending.length) {
      say("The database is up to date.");
      return null;
    }

    // Rows added by hand (the baseline) can leave the id counter behind the table, and then
    // recording a migration fails with "The following field is invalid: id".
    await drizzle.execute(
      sql.raw(
        `SELECT setval(pg_get_serial_sequence('payload_migrations', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM payload_migrations), false)`,
      ),
    );

    for (const m of pending) {
      const started = Date.now();
      const req = await createLocalReq({}, payload);
      try {
        await drizzle.transaction((tx) => m.up({ db: tx, payload, req } as unknown as MigrateUpArgs));
      } catch (err) {
        fail(`! ${m.name} failed, nothing from it was applied: ${(err as Error).message.split("\n")[0]}`);
      }
      try {
        await payload.create({ collection: "payload-migrations", data: { name: m.name, batch } });
      } catch (err) {
        // The changes are in; only the record is missing, so the next run repeats this (harmless) one.
        fail(`! ${m.name} was applied but could not be recorded: ${(err as Error).message.split("\n")[0]}`);
      }
      say(`  applied ${m.name} (${Date.now() - started} ms)`);
    }
    say("Done.");
    return null;
  },
};
