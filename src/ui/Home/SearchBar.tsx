import { SearchIcon } from "@/ui/Icons";

/** Floating search bar under the hero; submits to /search. */
export default function SearchBar({ defaultValue = "", floating = true }: { defaultValue?: string; floating?: boolean }) {
  return (
    <form
      action="/search"
      role="search"
      className={`${floating ? "relative z-10 -mt-6 mx-auto w-[calc(100%-2rem)] max-w-3xl shadow-lg" : "w-full max-w-3xl"} flex items-stretch bg-white`}
    >
      <label className="flex flex-1 items-center gap-2 px-4">
        <SearchIcon className="h-4 w-4 shrink-0 text-ink" />
        <span className="sr-only">Search equipment and solutions</span>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search Equipment And Solutions..."
          className="w-full py-3 text-sm outline-none placeholder:text-neutral-500"
        />
      </label>
      <button type="submit" className="bg-brand px-6 text-sm font-semibold uppercase tracking-wide text-ink hover:bg-ink hover:text-brand sm:px-12">
        Search
      </button>
    </form>
  );
}
