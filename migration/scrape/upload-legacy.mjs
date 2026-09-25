/**
 * Upload public/legacy/** to Supabase Storage (S3 API) under `legacy/` in the public
 * S3_BUCKET, so production can serve /legacy/* via the rewrite in next.config.mjs.
 * Skips objects that already exist with the same size. Safe to re-run.
 *
 * Run: node --env-file=.env migration/scrape/upload-legacy.mjs
 */
import fs from "fs";
import path from "path";
import https from "https";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "public/legacy");
const PREFIX = "legacy/";
const { S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

// Some ISPs hijack DNS for *.supabase.co (resolves to a block page). Resolve those
// hosts over Cloudflare DNS-over-HTTPS instead of the system resolver.
const dohCache = new Map();
async function doh(host) {
  if (!dohCache.has(host)) {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${host}&type=A`, { headers: { accept: "application/dns-json" } });
    const ips = ((await r.json()).Answer ?? []).filter((a) => a.type === 1).map((a) => a.data);
    if (!ips.length) throw new Error(`DoH: no A record for ${host}`);
    dohCache.set(host, ips[0]);
  }
  return dohCache.get(host);
}
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 16,
  lookup: (host, opts, cb) => {
    if (!host.endsWith(".supabase.co")) return import("dns").then((d) => d.lookup(host, opts, cb));
    doh(host).then((ip) => (opts?.all ? cb(null, [{ address: ip, family: 4 }]) : cb(null, ip, 4)), cb);
  },
});

const s3 = new S3Client({
  requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
  endpoint: S3_ENDPOINT,
  region: S3_REGION || "us-east-1",
  forcePathStyle: true,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
});

const TYPES = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
  svg: "image/svg+xml", avif: "image/avif", ico: "image/x-icon", pdf: "application/pdf",
  mp3: "audio/mpeg", mp4: "video/mp4", webm: "video/webm", json: "application/json",
};

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

const existing = new Map();
let token;
do {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: PREFIX, ContinuationToken: token }));
  for (const o of r.Contents ?? []) existing.set(o.Key, o.Size);
  token = r.IsTruncated ? r.NextContinuationToken : undefined;
} while (token);

const files = walk(SRC).filter((f) => !path.basename(f).startsWith("_"));
const todo = files.filter((f) => {
  const key = PREFIX + path.relative(SRC, f).split(path.sep).join("/");
  return existing.get(key) !== fs.statSync(f).size;
});
console.log(`${files.length} local files, ${existing.size} already uploaded, ${todo.length} to upload`);

let done = 0, failed = [];
const queue = [...todo];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const key = PREFIX + path.relative(SRC, f).split(path.sep).join("/");
      const ext = f.split(".").pop().toLowerCase();
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: fs.readFileSync(f),
            ContentType: TYPES[ext] || "application/octet-stream",
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
        if (++done % 100 === 0) console.log(`  ${done}/${todo.length}`);
      } catch (e) {
        failed.push(`${key}: ${e.name} ${e.message}`);
      }
    }
  }),
);
console.log({ uploaded: done, failed: failed.length });
if (failed.length) console.log(failed.slice(0, 20).join("\n"));
