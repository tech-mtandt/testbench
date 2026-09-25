/**
 * Materialise every `/legacy/<path>` asset referenced from src/content/** into public/legacy/.
 * Source order: the local Laravel checkout (../website/public/<path>), then the live site.
 * Raster images wider than MAX_W are downscaled in place (same filename/format).
 *
 * Run: node migration/scrape/copy-assets.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const LEGACY = path.resolve(ROOT, "../website/public");
const DEST = path.join(ROOT, "public/legacy");
const MAX_W = 1600;

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

const refs = new Set();
for (const f of [...walk(path.join(ROOT, "src/content")), ...walk(path.join(ROOT, "src/app"))]) {
  if (!/\.(json|ts|tsx)$/.test(f)) continue;
  // Legacy filenames can contain spaces/parens; stop only at quotes, backslashes or newlines.
  for (const m of fs.readFileSync(f, "utf8").matchAll(/\/legacy\/([^"'`\\\n]+)/g)) {
    let rel = m[1].trim();
    if (rel.includes("${")) continue;
    try { rel = decodeURIComponent(rel) } catch {}
    refs.add(rel);
  }
}
console.log(`${refs.size} referenced assets`);

let copied = 0, fetched = 0, skipped = 0, missing = [];
const tasks = [...refs];
async function one(rel) {
  const out = path.join(DEST, rel);
  if (fs.existsSync(out)) return skipped++;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let buf;
  const local = path.join(LEGACY, rel);
  if (fs.existsSync(local)) { buf = fs.readFileSync(local); copied++ }
  else {
    try {
      const res = await fetch(`https://www.mtandt.com/${rel.split("/").map(encodeURIComponent).join("/")}`, { headers: { "user-agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(String(res.status));
      buf = Buffer.from(await res.arrayBuffer()); fetched++;
    } catch (e) { missing.push(`${rel} (${e.message})`); return }
  }
  if (/\.(jpe?g|png|webp)$/i.test(rel)) {
    try {
      const img = sharp(buf, { failOn: "none" });
      const meta = await img.metadata();
      if (meta.width && meta.width > MAX_W) {
        const ext = rel.split(".").pop().toLowerCase();
        const r = img.resize({ width: MAX_W });
        buf = await (ext === "png" ? r.png({ compressionLevel: 9 }) : ext === "webp" ? r.webp({ quality: 80 }) : r.jpeg({ quality: 80, mozjpeg: true })).toBuffer();
      }
    } catch {}
  }
  fs.writeFileSync(out, buf);
}
const CONC = 8;
await Promise.all(Array.from({ length: CONC }, async () => { while (tasks.length) await one(tasks.shift()) }));
console.log({ copied, fetched, skipped, missing: missing.length });
if (missing.length) fs.writeFileSync(path.join(DEST, "_missing.txt"), missing.join("\n"));
