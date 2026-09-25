import mysql from 'mysql2/promise'

/** Source Laravel/MySQL connection. Server: local MySQL 8.4 @ 127.0.0.1:3306. */
export async function mysqlConn() {
  return mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mtandt_local',
    dateStrings: true,
  })
}

/** Parse the legacy JSON-string-array id columns e.g. '["9","10"]' -> [9,10]. */
export function parseIdArray(v: unknown): number[] {
  if (v == null) return []
  const s = String(v).trim()
  if (s === '' || s === 'null' || s === '[]' || s === '"null"') return []
  try {
    const arr = JSON.parse(s)
    if (Array.isArray(arr)) return arr.map((x) => parseInt(String(x), 10)).filter((n) => Number.isFinite(n))
  } catch {
    // fall through to CSV fallback
  }
  return s
    .split(',')
    .map((x) => parseInt(x.replace(/["[\]]/g, '').trim(), 10))
    .filter((n) => Number.isFinite(n))
}

export const clean = (v: unknown): string | undefined => {
  if (v == null) return undefined
  const s = String(v).trim()
  return s === '' || s === 'null' ? undefined : s
}
