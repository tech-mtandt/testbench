import Link from "next/link";
import { fmtLong, type BlogCard } from "@/content/media";

function Card({ post, className = "", big }: { post: BlogCard; className?: string; big?: boolean }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={`group relative flex flex-col justify-between overflow-hidden bg-neutral-700 bg-cover bg-center p-5 no-underline ${className}`}
      style={post.image ? { backgroundImage: `url("${post.image}")` } : undefined}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/75 transition-colors group-hover:bg-black/20" />
      <h6 className="relative line-clamp-1 text-xs font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/.5)]">{post.category}</h6>
      <div className={`relative ${big ? "md:max-w-[62%]" : ""}`}>
        <h2 className={`line-clamp-3 font-semibold text-white group-hover:underline ${big ? "text-base md:text-lg" : "text-base"}`}>
          {post.title}
        </h2>
        <span className="mt-1 block text-xs text-white/80">{fmtLong(post.date)}</span>
      </div>
    </Link>
  );
}

/** Magazine layout: one large + two stacked cards, then rows of three. */
export default function BlogGrid({ posts }: { posts: BlogCard[] }) {
  const [a, b, c, ...rest] = posts;
  return (
    <div className="space-y-6">
      {a && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.43fr)_minmax(0,1fr)]">
          <Card post={a} big className="min-h-64 md:min-h-[430px]" />
          <div className="grid gap-6 md:grid-rows-2">
            {b && <Card post={b} className="min-h-52" />}
            {c && <Card post={c} className="min-h-52" />}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Card key={p.slug} post={p} className="min-h-[259px]" />
          ))}
        </div>
      )}
    </div>
  );
}
