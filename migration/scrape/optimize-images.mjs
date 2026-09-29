/**
 * Pre-generate responsive WebP variants for every raster image in public/legacy:
 *   public/legacy/<path>.<ext>  ->  public/legacy-opt/<path>.<ext>.w{480,960,1600}.webp
 * Never upscales (small images get copies at their own width), so every variant exists
 * and <Img> can emit a srcset without a manifest. Safe to re-run (skips up-to-date files).
 *
 * Run: node migration/scrape/optimize-images.mjs
 * Then publish: node --env-file=.env migration/scrape/upload-legacy.mjs legacy-opt
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const WIDTHS = [480, 960, 1600];
const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "public/legacy");
const DEST = path.join(ROOT, "public/legacy-opt");
const RASTER = /\.(jpe?g|png|webp)$/i;

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

const files = walk(SRC).filter((f) => RASTER.test(f));
let made = 0, skipped = 0, failed = 0, inBytes = 0, outBytes = 0;
const undecodable = [];
const queue = [...files];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const rel = path.relative(SRC, f);
      const srcStat = fs.statSync(f);
      try {
        const targets = WIDTHS.map((w) => ({ w, out: path.join(DEST, `${rel}.w${w}.webp`) }));
        if (targets.every((t) => fs.existsSync(t.out) && fs.statSync(t.out).mtimeMs >= srcStat.mtimeMs)) {
          skipped++;
          continue;
        }
        fs.mkdirSync(path.dirname(targets[0].out), { recursive: true });
        const buf = fs.readFileSync(f);
        inBytes += buf.length;
        for (const { w, out } of targets) {
          const data = await sharp(buf, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toBuffer();
          fs.writeFileSync(out, data);
          if (w === 960) outBytes += data.length;
        }
        made++;
      } catch (e) {
        failed++;
        undecodable.push(rel.split(path.sep).join("/"));
        console.warn("skip", rel, e.message.split("\n")[0]);
      }
    }
  }),
);
// <Img> serves the original for these (e.g. JPEGs with junk bytes browsers tolerate but libvips rejects)
fs.writeFileSync(path.join(ROOT, "src/lib/legacy-image-skip.json"), JSON.stringify(undecodable.sort(), null, 1) + "\n");
console.log({ images: files.length, made, skipped, failed, originalMB: +(inBytes / 1e6).toFixed(1), w960MB: +(outBytes / 1e6).toFixed(1) });
