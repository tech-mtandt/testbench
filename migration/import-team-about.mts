/**
 * Creates Users from our_team, then populates the About global (MERGING with existing rows):
 *   investors  <- our_team category 1 (Modi family / owners)   [{user, designation}]
 *   management <- our_team category 2 (executive team)          [{user, designation}]
 *   groupOfCompanies <- joint_ventures (19)                     [{icon, title, link}]
 * Users get synthesized emails + placeholder passwords + role 'user' (fix up later).
 * Idempotent: users upsert by email; About arrays dedupe by user-id / title.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-team-about.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

const emailUsed = new Set<string>()
function synthEmail(name: string) {
  const parts = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/).filter(Boolean)
  let base = (parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : (parts[0] || 'member'))
  let email = `${base}@mtandt.com`, i = 1
  while (emailUsed.has(email)) email = `${base}${++i}@mtandt.com`
  emailUsed.add(email); return email
}
function splitName(name: string) { const p = name.trim().split(/\s+/); return { firstName: p[0] || name, lastName: p.slice(1).join(' ') || '-' } }

async function main() {
  const payload: any = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // seed emailUsed with existing users to avoid collisions
  const existingUsers = await payload.find({ collection: 'users', limit: 1000, depth: 0 })
  for (const u of existingUsers.docs) if (u.email) emailUsed.add(u.email)

  // 1) create Users from our_team
  const [team] = (await db.query('SELECT id,category,name,post,image FROM our_team ORDER BY category,sort_order')) as any
  const userIdByTeamId = new Map<number, string>()
  let created = 0, reused = 0
  for (const t of team) {
    const name = clean(t.name); if (!name) continue
    const { firstName, lastName } = splitName(name)
    const photo = await ensureMedia(payload, t.image, mc)
    // reuse if a user with same name already exists (by first+last)
    const match = await payload.find({ collection: 'users', where: { and: [{ firstName: { equals: firstName } }, { lastName: { equals: lastName } }] }, limit: 1, depth: 0 })
    if (match.docs.length) { userIdByTeamId.set(Number(t.id), match.docs[0].id); reused++; continue }
    const email = synthEmail(name)
    const u = await payload.create({ collection: 'users', data: {
      email, password: `Mtandt#${Math.random().toString(36).slice(2, 10)}`,
      firstName, lastName, jobTitle: clean(t.post), profilePicture: photo, roles: ['user'],
    }, depth: 0 })
    userIdByTeamId.set(Number(t.id), u.id); created++
  }
  console.log(`users: ${created} created, ${reused} reused (from ${team.length} team rows)`)

  // 2) build investors (cat 1) / management (cat 2)
  const investorsNew = team.filter((t: any) => Number(t.category) === 1).map((t: any) => ({ user: userIdByTeamId.get(Number(t.id)), designation: clean(t.post) })).filter((x: any) => x.user)
  const managementNew = team.filter((t: any) => Number(t.category) === 2).map((t: any) => ({ user: userIdByTeamId.get(Number(t.id)), designation: clean(t.post) })).filter((x: any) => x.user)

  // 3) groupOfCompanies from joint_ventures
  const [jv] = (await db.query('SELECT venture_name,website_url,image FROM joint_ventures')) as any
  const gocNew = []
  for (const j of jv) { const title = clean(j.venture_name); if (!title) continue; gocNew.push({ title, link: clean(j.website_url), icon: await ensureMedia(payload, j.image, mc) }) }

  // 4) merge with existing About (don't clobber teammate's rows)
  const about = await payload.findGlobal({ slug: 'about', depth: 0 }) as any
  const uid = (r: any) => String(typeof r.user === 'object' ? r.user?.id : r.user)
  const mergePeople = (existing: any[] = [], added: any[]) => {
    const seen = new Set(existing.map(uid)); const out = [...existing]
    for (const a of added) if (!seen.has(String(a.user))) { seen.add(String(a.user)); out.push(a) }
    return out
  }
  const mergeGoc = (existing: any[] = [], added: any[]) => {
    const seen = new Set(existing.map((e) => (e.title || '').toLowerCase())); const out = [...existing]
    for (const a of added) if (!seen.has((a.title || '').toLowerCase())) { seen.add((a.title || '').toLowerCase()); out.push(a) }
    return out
  }
  const investors = mergePeople(about.investors, investorsNew)
  const management = mergePeople(about.management, managementNew)
  const groupOfCompanies = mergeGoc(about.groupOfCompanies, gocNew)

  await payload.updateGlobal({ slug: 'about', data: { investors, management, groupOfCompanies } })
  console.log(`About -> investors ${investors.length} (was ${about.investors?.length || 0}), management ${management.length} (was ${about.management?.length || 0}), groupOfCompanies ${groupOfCompanies.length} (was ${about.groupOfCompanies?.length || 0})`)

  await db.end()
  console.log('\nDONE.')
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
