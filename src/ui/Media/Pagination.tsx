import Link from "next/link";

/** Numbered pager as on the legacy media listings (‹ 1 2 3 … ›). */
export default function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  const cls = "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm no-underline";
  return (
    <nav aria-label="Pagination" className="mt-10 flex justify-center md:justify-end">
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" aria-label="Previous page" className={`${cls} text-ink hover:bg-brand-light`}>
              ‹
            </Link>
          ) : (
            <span className={`${cls} text-ink-soft/50`} aria-hidden>
              ‹
            </span>
          )}
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            {n === page ? (
              <span aria-current="page" className={`${cls} border border-ink/60 bg-brand font-medium text-ink`}>
                {n}
              </span>
            ) : (
              <Link href={href(n)} className={`${cls} text-ink hover:bg-brand-light`}>
                {n}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} rel="next" aria-label="Next page" className={`${cls} text-ink hover:bg-brand-light`}>
              ›
            </Link>
          ) : (
            <span className={`${cls} text-ink-soft/50`} aria-hidden>
              ›
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export function parsePage(v: string | string[] | undefined) {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
