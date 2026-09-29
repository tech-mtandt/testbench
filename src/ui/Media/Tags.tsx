export default function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-6 flex items-baseline gap-3">
      <h4 className="text-sm font-semibold">Tags:</h4>
      <p className="text-sm text-ink">
        {tags.map((t, i) => (
          <span key={t}>
            {i > 0 && " / "}
            {t}
          </span>
        ))}
      </p>
    </div>
  );
}
