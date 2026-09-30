/**
 * CLI twin of the dashboard "Import website content" panel (for developers with .env).
 *   node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/cms-import.mts [task...] [--overwrite]
 * With no task keys, runs every task in order.
 */
import { boot } from './lib/payload.mts'
import { listTasks, runTask } from '../src/cms/import/run'

const args = process.argv.slice(2)
const overwrite = args.includes('--overwrite')
const keys = args.filter((a) => !a.startsWith('--'))
const payload = await boot()
for (const { key, label } of listTasks()) {
  if (keys.length && !keys.includes(key)) continue
  console.log(`\n== ${label}`)
  let cursor: number | null = 0
  while (cursor !== null) {
    const r = await runTask(payload, key, cursor, overwrite, 10 * 60_000)
    r.log.forEach((l) => console.log(l))
    cursor = r.next
  }
}
process.exit(0)
