"use client";

import { useMemo, useState } from "react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@/components/RichText";

export type LocationItem = {
  id: string;
  title: string | null;
  label: string | null;
  address: SerializedEditorState | null;
  addressText: string;
  phones: string[];
  emails: string[];
  mapsUrl: string | null;
  city: string | null;
  country: string | null;
};

function uniqueInOrder(values: (string | null | undefined)[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (value && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

export default function ContactLocations({
  locations,
}: {
  locations: LocationItem[];
}) {
  const [countryTab, setCountryTab] = useState<"India" | "Overseas">("India");

  const indiaLocations = useMemo(
    () => locations.filter((l) => l.country === "India"),
    [locations],
  );
  const overseasLocations = useMemo(
    () => locations.filter((l) => l.country && l.country !== "India"),
    [locations],
  );

  const bucket = countryTab === "India" ? indiaLocations : overseasLocations;
  const cities = useMemo(
    () => uniqueInOrder(bucket.map((l) => l.city)),
    [bucket],
  );

  const [selectedCity, setSelectedCity] = useState<string | null>(
    cities[0] ?? null,
  );

  const activeCity = cities.includes(selectedCity ?? "")
    ? selectedCity
    : (cities[0] ?? null);

  const filtered = activeCity
    ? bucket.filter((l) => l.city === activeCity)
    : bucket;

  if (locations.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex">
        {(["India", "Overseas"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setCountryTab(tab);
              setSelectedCity(null);
            }}
            className={`flex-1 py-4 text-sm font-bold uppercase sm:flex-none sm:px-16 ${
              countryTab === tab
                ? "bg-primary-yellow text-black"
                : "bg-black/60 text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {cities.length > 0 && (
        <div className="flex flex-wrap gap-6 bg-[#f2f2f2] px-6 py-4">
          {cities.map((city) => (
            <div key={city} className="relative overflow-hidden">
              <button
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`block p-0 text-sm leading-none font-semibold ${
                  city === activeCity
                    ? "text-black"
                    : "text-black/50 hover:text-black/80"
                }`}
              >
                {city}
              </button>
              {city === activeCity && (
                <span className="w-4 h-4 bg-primary-yellow" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 py-6">
        {filtered.length === 0 ? (
          <p className="text-black/60">No offices listed here yet.</p>
        ) : (
          filtered.map((location) => {
            const mapQuery = encodeURIComponent(
              location.addressText || location.title || "",
            );
            const embedSrc = mapQuery
              ? `https://www.google.com/maps?q=${mapQuery}&output=embed`
              : null;
            const openInMapsHref =
              location.mapsUrl ||
              (mapQuery ? `https://www.google.com/maps?q=${mapQuery}` : null);

            return (
              <div
                key={location.id}
                className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-3"
              >
                <div className="my-3 flex flex-col items-center justify-center bg-black px-6 py-10 text-center">
                  {location.title && (
                    <p className="text-lg font-bold text-white md:text-xl">
                      {location.title}
                    </p>
                  )}
                  {location.label && (
                    <p className="text-lg font-bold text-primary-yellow md:text-xl">
                      {location.label}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 bg-primary-yellow px-6 py-6">
                  {location.address && (
                    <div className="flex gap-4 border-b border-black/20 pb-4">
                      <p className="w-24 shrink-0 font-bold whitespace-nowrap">
                        Address:
                      </p>
                      <RichText
                        data={location.address}
                        className="[&_p]:m-0 [&_p]:text-base [&_p]:text-blue-950"
                      />
                    </div>
                  )}
                  {location.phones.length > 0 && (
                    <div className="flex gap-4 border-b border-black/20 pb-4">
                      <p className="w-24 shrink-0 font-bold whitespace-nowrap">
                        Phone:
                      </p>
                      <div className="flex flex-col gap-1">
                        {location.phones.map((phone, index) => (
                          <a
                            key={`${phone}-${index}`}
                            href={`tel:${phone.replace(/\s+/g, "")}`}
                            className="text-blue-950 hover:underline"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {location.emails.length > 0 && (
                    <div className="flex gap-4">
                      <p className="w-24 shrink-0 font-bold whitespace-nowrap">
                        Email ID:
                      </p>
                      <div className="flex flex-col gap-1">
                        {location.emails.map((email, index) => (
                          <a
                            key={`${email}-${index}`}
                            href={`mailto:${email}`}
                            className="text-blue-950 hover:underline"
                          >
                            {email}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative my-3 min-h-[196px] w-full">
                  {embedSrc && (
                    <iframe
                      src={embedSrc}
                      title={location.title || "Map"}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                    />
                  )}
                  {openInMapsHref && (
                    <a
                      href={openInMapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 left-3 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow"
                    >
                      Open in Maps ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
