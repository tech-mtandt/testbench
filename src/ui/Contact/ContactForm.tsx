"use client";

import Link from "next/link";

const PRODUCT_OPTIONS = [
  "Aerial Work Platforms",
  "Material Handling Equipment",
  "Aluminium Scaffolding",
  "Temporary Road Mats",
  "Other",
];

const LOOKING_TO_OPTIONS = ["Buy", "Rent", "Service", "General Enquiry"];

export default function ContactForm() {
  const inputClass =
    "w-full border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:border-primary-yellow focus:outline-none";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="text" placeholder="Full Name*" required className={inputClass} />
        <input type="email" placeholder="Email*" required className={inputClass} />
        <input type="text" placeholder="Company Name*" required className={inputClass} />
        <input type="text" placeholder="Designation*" required className={inputClass} />
        <input type="tel" placeholder="Mobile Number*" required className={inputClass} />
        <input type="text" placeholder="Location*" required className={inputClass} />
        <select defaultValue="" className={inputClass}>
          <option value="" disabled>
            -- Choose A Product --
          </option>
          {PRODUCT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select defaultValue="" className={inputClass}>
          <option value="" disabled>
            -- Looking To --
          </option>
          {LOOKING_TO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <textarea placeholder="Your Message" rows={5} className={`${inputClass} resize-none`} />

      <label className="flex items-start gap-2 text-sm text-black/70">
        <input
          type="checkbox"
          defaultChecked
          className="mt-1 h-4 w-4 shrink-0 accent-primary-yellow"
        />
        <span>
          Sign up to receive emails from Mtandt Group about products, services, offers, news and
          events (you can unsubscribe at any time). See{" "}
          <Link href="/privacy-policy" className="underline">
            privacy policy
          </Link>{" "}
          for more details.
        </span>
      </label>

      <div>
        <button
          type="submit"
          className="bg-primary-yellow px-10 py-3 text-sm font-bold uppercase"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
